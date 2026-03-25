import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import { PubSub } from 'graphql-subscriptions';
import { PrismaClient } from '@prisma/client';
import { typeDefs, productTypeDefs } from './graphql/graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { productResolvers } from './graphql/resolvers/productResolvers';
import { travelBookingResolvers } from './graphql/resolvers/travelBookingResolvers';
import { GraphQLContext } from './types/context';
import { seedDatabase } from './utils/seedDatabase';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;

const prisma = new PrismaClient();

const resolvers = {
  Query: {
    ...productResolvers.Query,
    ...travelBookingResolvers.Query,
  },
  Mutation: {
    ...productResolvers.Mutation,
    ...travelBookingResolvers.Mutation,
  },
  Subscription: {
    ...travelBookingResolvers.Subscription,
  },
  Product: productResolvers.Product,
};

// Konfiguracja CORS dla GraphQL
const corsOptions = {
  origin: '*', // W produkcji ustaw konkretne domeny
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

async function startServer() {
  // Check if database is empty and seed if needed
  try {
    await seedDatabase(prisma);
  } catch (error) {
    console.error('Failed to seed database:', error);
    // Continue anyway - the app might still work if database already has data
  }

  const schema = makeExecutableSchema({
    typeDefs: [typeDefs, productTypeDefs],
    resolvers,
  });

// Initialize PubSub for subscriptions
  const pubsub = new PubSub();
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer({
    schema,
    context: async () => {
      const user = await prisma.user.findUnique({ where: { id: '3' } });
      const ctx: GraphQLContext = { req: undefined as any, user, prisma, pubsub };
      return ctx;
    },
  }, wsServer);

  const server = new ApolloServer({
    schema,
    csrfPrevention: false,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    introspection: true,
  });

  await server.start();

  // Zastosuj CORS przed parsowaniem JSON
  app.use(cors(corsOptions));
  app.use(express.json());

  // Standardowy endpoint GraphQL
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }): Promise<GraphQLContext> => {
        // Temporary dev user for mutations/queries
        const user = await prisma.user.findUnique({ where: { id: '3' } });
        return { req, user, prisma, pubsub };
      },
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  await new Promise<void>((resolve) => {
    httpServer.listen({ port: PORT }, resolve);
  });
  
  console.log(`🚀 GraphQL server ready at http://localhost:${PORT}/graphql`);
  console.log(`📊 GraphQL Playground available at http://localhost:${PORT}/graphql`);
}

startServer().catch((error) => {
  console.error('Failed to start GraphQL server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});