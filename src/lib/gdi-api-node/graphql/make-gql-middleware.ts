import { GraphQLEndpoint } from './types'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('application:gql-middleware')

/** Create Koa middleware that executes given GraphQL endpoint, passing {query, variables} */
export function makeGqlMiddleware<TContext, TModel>(
	endpoint: GraphQLEndpoint<TContext, TModel>,
	{
		mapQuery = q => q,
		mapVariables = v => v,
	}: {
        mapQuery?: (q: any) => any,
        mapVariables?: (q: any) => any
    } = {}
): (ctx: any) => Promise<void> {
	debug('creating middleware')
	return async ctx => {
		const { request: { body: { query, variables } } } = ctx
		const result = await endpoint({
			context: ctx,
			query: mapQuery(query),
			variables: mapVariables(variables),
		})
		ctx.body = result
	}
}