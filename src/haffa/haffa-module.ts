import { ApplicationContext, makeGqlEndpoint, makeGqlMiddleware } from '@helsingborg-stad/gdi-api-node'
import { requireHaffaUser } from '../login/require-haffa-user'
import { Services } from '../types'
import { createHaffaGqlModule } from './haffa-gql-module'

export const graphQLModule = (services: Pick<Services, 'adverts'|'files'|'profiles'>) => 
	({ registerKoaApi }: ApplicationContext): void => registerKoaApi({
		haffaGQL: requireHaffaUser(
			makeGqlMiddleware(
				makeGqlEndpoint(
					createHaffaGqlModule(services)))),
	})
