import { ApplicationContext, ApplicationModule, GraphQLModule, makeGqlEndpoint, makeGqlMiddleware } from '@helsingborg-stad/gdi-api-node'
import { AdvertsRepository } from './types'
import { haffaGqlSchema } from './gql/schema/haffa.gql.schema'
import { FilesService } from '../files/types'
import { requireHaffaUser } from '../login/require-haffa-user'
import { advertsResolver } from './gql/schema/adverts-resolver'
import { termsResolver } from './gql/terms-resolver'
import { EntityResolverMap } from '@helsingborg-stad/gdi-api-node/graphql'

export const advertsModule = (adverts: AdvertsRepository, files: FilesService): ApplicationModule => ({ registerKoaApi }: ApplicationContext) => registerKoaApi({
	haffaGQL: requireHaffaUser(makeGqlMiddleware(makeGqlEndpoint(createAdvertsModule(adverts, files)))),
})

const createAdvertsModule = (adverts: AdvertsRepository, files: FilesService): GraphQLModule => ({
	schema: haffaGqlSchema,
	resolvers: mergeResolvers(advertsResolver(adverts, files), termsResolver()),
})

const mergeResolvers = (...resolvers: EntityResolverMap[]): EntityResolverMap => {
	const result: EntityResolverMap = {}
	resolvers.forEach(resolver => {
		Object.entries(resolver)
			.forEach(([ type, typeResolver ]) => {
				result[type] = {
					...result[type],
					...typeResolver,
				}
			})
	})
	return result
}
/*
	resolvers.reduce((result, resolver) => 
		Object.entries(resolver).map(([ type, typeResolver ]) => ({ type, typeResolver }))
			.reduce((existing, { type, typeResolver }) => ({
				...result,
				[type]: { ...existing[type], ...typeResolver },
			}), result),
	{}
	)
*/