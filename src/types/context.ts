import { PubSub } from 'graphql-subscriptions';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';

// Define the GraphQL context interface
export interface GraphQLContext {
  req: Request;
  prisma: PrismaClient;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  pubsub: PubSub;
}

