# NodeGraphqlStarter

Starter backend project using **Node.js + TypeScript + GraphQL (Apollo Server) + Prisma + PostgreSQL**.

## Features

- GraphQL API (`/graphql`) with queries, mutations, and subscriptions
- Travel booking domain (`offers`, `bookOffer`, booking status updates)
- Example in-memory product CRUD resolvers
- Prisma integration for PostgreSQL
- Database seeding from `src/data/data.json`
- Health check endpoint at `/health`

## Tech Stack

- Node.js
- TypeScript
- Express 5
- Apollo Server
- GraphQL WS subscriptions
- Prisma ORM
- PostgreSQL (Docker Compose)

## Project Structure

- `src/server.ts` – app/server bootstrap
- `src/graphql/schema.graphql` – travel booking schema
- `src/graphql/product.schema.graphql` – product schema
- `src/graphql/resolvers/` – GraphQL resolvers
- `prisma/schema.prisma` – Prisma schema
- `src/utils/seedDatabase.ts` – seed logic
- `docker-compose.yml` – local PostgreSQL

## Prerequisites

- Node.js 18+
- npm
- Docker (for local PostgreSQL)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

3. Generate Prisma client:

   ```bash
   npm run prisma:generate
   ```

4. Apply migrations:

   ```bash
   npm run prisma:migrate
   ```

5. Run in development:

   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` – run server with ts-node
- `npm run build` – compile TypeScript
- `npm start` – run compiled server from `dist`
- `npm run prisma:generate` – generate Prisma client
- `npm run prisma:migrate` – run Prisma migrations
- `npm run prisma:studio` – open Prisma Studio

## GraphQL Endpoints

- HTTP: `http://localhost:3001/graphql`
- WebSocket subscriptions: `ws://localhost:3001/graphql`
- Health: `http://localhost:3001/health`

## Notes

- The app seeds the database automatically on startup if tables are empty.
- Current repository build shows a TypeScript deprecation error related to `baseUrl` in `tsconfig.json`.
