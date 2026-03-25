declare module '*.graphql' {
  import { DocumentNode } from 'graphql';
  const value: DocumentNode;
  export default value;
}

// GraphQL Resolver types
import { GraphQLResolveInfo } from 'graphql';

export type GraphQLResolver<TSource = any, TArgs = any, TContext = any, TReturn = any> = (
  parent: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TReturn | Promise<TReturn>;

export type GraphQLResolvers<TContext = any> = {
  [key: string]: {
    [key: string]: 
      | GraphQLResolver<any, any, TContext, any>
      | {
          subscribe?: GraphQLResolver<any, any, TContext, any>;
          resolve?: GraphQLResolver<any, any, TContext, any>;
        }
      | any; // Allow any for flexibility with Apollo Server resolver structure
  };
};

