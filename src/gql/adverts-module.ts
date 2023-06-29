import { ApplicationContext, ApplicationModule, GraphQLModule, makeGqlEndpoint, makeGqlMiddleware } from '@helsingborg-stad/gdi-api-node'
import { AdvertsRepository } from '../adverts/types'
import { haffaGqlSchema } from './schema/haffa.gql.schema'
import { FilesService } from '../files/types'
import { requireHaffaUser } from '../login/require-haffa-user'
import { advertsResolver } from './adverts-resolver'
import { termsResolver } from './terms-resolver'
import { EntityResolverMap } from '@helsingborg-stad/gdi-api-node/graphql'
import { profileResolver } from './profile-resolver'
import { Services } from '../types'

export const graphQLModule = (services: Pick<Services, 'adverts'|'files'|'profiles'>) => 
	({ registerKoaApi }: ApplicationContext) => registerKoaApi({
		haffaGQL: requireHaffaUser(makeGqlMiddleware(makeGqlEndpoint(createAdvertsModule(services)))),
	})

const createAdvertsModule = ({ adverts, files, profiles }: Pick<Services, 'adverts'|'files'|'profiles'>): GraphQLModule => ({
	schema: haffaGqlSchema,
	resolvers: mergeResolvers(advertsResolver(adverts, files), profileResolver(profiles), termsResolver()),
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