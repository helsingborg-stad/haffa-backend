export interface GraphQLModule<TContext = any, TModel = any> {
    schema: string
    resolvers: EntityResolverMap<TContext, TModel> // | ResolverMap<TContext, TModel>[]
}
// obj, args, context, info
// https://www.graphql-tools.com/docs/resolvers

// We stray away from resolver functions as defined in https://www.graphql-tools.com/docs/resolvers
// and move from
//      resolver(obj, args, context, info)
// to
//      resolver({source, ctx, args, info})

// export type ResolverFn<TContext, TModel> = (source?: TModel, args?: any, context?: TContext, info?: any) => any
export type ResolverFn<TContext, TModel> = ({ source, ctx, args, info }: {source?: TModel, args?: any, ctx?: TContext, info?: any, cache: GraphQLPerRequestCache}) => any
export type FieldResolverMap<TContext = any, TModel = any> = Record<string, ResolverFn<TContext, TModel>>
export type EntityResolverMap<TContext = any, TModel = any> = Record<string, FieldResolverMap<TContext, TModel>>

export type GraphQLEndpointArgs<TContext, TModel> = {
    context?: TContext, 
    model?: TModel, 
    query: string, 
    variables: Record<string, any>,
}

export interface GraphQLPerRequestCache {
    getOrCreateCachedValue: <T>(name: string, factory: (() => T)) => T
}

export type GraphQLEndpoint<TContext, TModel> = (args: GraphQLEndpointArgs<TContext, TModel>) => Promise<any>
