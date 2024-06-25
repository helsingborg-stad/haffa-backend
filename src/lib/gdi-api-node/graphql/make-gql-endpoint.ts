import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql } from 'graphql'
import { mapValues } from '../util'
import type {
  GraphQLEndpoint,
  GraphQLEndpointArgs,
  GraphQLModule,
  GraphQLPerRequestCache,
} from './types'

const createPerRequestCache = (): GraphQLPerRequestCache => {
  const cache: any = {}
  return {
    getOrCreateCachedValue: (name, factory) => {
      if (!cache[name]) {
        cache[name] = { v: factory() }
      }
      return cache[name].v
    },
  }
}
const bindPerRequestCache = <TContext>(
  ctx: TContext
): GraphQLPerRequestCache => {
  const c = ctx as any
  // fast return
  const fc = c?.state?.gqlCache
  if (fc) {
    return fc
  }
  // construct cache
  if (!c.state) {
    c.state = {}
  }
  if (!c.state.gqlCache) {
    c.state.gqlCache = createPerRequestCache()
  }
  return c.state.gqlCache
}

/** create endpoint function that given parameters resolves against a GraphQL module  */
export function makeGqlEndpoint<TContext = any, TModel = any>({
  schema,
  resolvers,
}: GraphQLModule<TContext, TModel>): GraphQLEndpoint<TContext, TModel> {
  const es = makeExecutableSchema({
    typeDefs: schema,
    // wrap resolver going from indexed arguments to parameter object
    resolvers: mapValues(resolvers, entity =>
      mapValues(
        entity,
        field => async (source: TModel, args: any, ctx: TContext, info: any) =>
          field({
            source,
            ctx,
            args,
            info,
            cache: bindPerRequestCache<TContext>(ctx),
          })
      )
    ),
  })

  return ({
    context,
    model,
    query,
    variables,
  }: GraphQLEndpointArgs<TContext, TModel>) =>
    graphql({
      schema: es,
      source: query,
      rootValue: model,
      contextValue: context,
      variableValues: variables,
    })
}
