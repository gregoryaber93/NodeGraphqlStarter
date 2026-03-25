// Register graphql-import-node to enable direct .graphql imports
import 'graphql-import-node/register';

// Import schema directly as a GraphQL DocumentNode
import typeDefs from './schema.graphql';
import productTypeDefs from './product.schema.graphql';

export { typeDefs, productTypeDefs };

// import { readFileSync } from 'fs';
// import { join } from 'path';
// import { gql } from 'graphql-tag';

// // Declare __dirname for TypeScript (available in CommonJS runtime)
// declare const __dirname: string;

// // Read the schema file from the same directory
// const schemaPath = join(__dirname, 'schema.graphql');
// const schemaContent = readFileSync(schemaPath, 'utf-8');
// export const typeDefs = gql(schemaContent);