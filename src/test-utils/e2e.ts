import request from 'supertest'
import { ApplicationRunHandler } from '@helsingborg-stad/gdi-api-node/application'
import { Services } from '../types'
import { Advert } from '../adverts/types'
import { LoginRequestEntry, createInMemoryLoginService } from '../login/in-memory-login-service/in-memory-login-service'
import { createTestApp, createTestServices } from './test-app'
import { createInMemoryAdvertsRepository } from '../adverts/in-memory-adverts-repository'
import { TokenService } from '../tokens/types'

const createGqlRequest = (tokens: TokenService, server: Parameters<ApplicationRunHandler>[0]) => 
	(query: string, variables: any): typeof request => 
		request(server)
			.post('/api/v1/haffa/graphql')
			.set({
				authorization: `Bearer ${tokens.sign({ id: 'test@user.com', roles: [] })}`,
			})
			.send({ query, variables })

export interface End2EndTestContext {
	gqlRequest: ReturnType<typeof createGqlRequest>,
	server: Parameters<ApplicationRunHandler>[0],
	services: Services,
	adverts: Record<string, Advert>
	logins: Record<string, LoginRequestEntry>
}

export interface End2EndTestHandler {
	(context: End2EndTestContext): Promise<void>
}
export const end2endTest = (handler: End2EndTestHandler): Promise<void> => {
	const adverts: Record<string, Advert> = {}
	const logins: Record<string, LoginRequestEntry> = {}
	const services = createTestServices({
		adverts: createInMemoryAdvertsRepository(adverts),
		login: createInMemoryLoginService({ db: logins }),
	})

	return createTestApp(services)
		.run(async server => handler({
			gqlRequest: createGqlRequest(services.tokens, server),
			server,
			services,
			adverts,
			logins,
		}))
}
