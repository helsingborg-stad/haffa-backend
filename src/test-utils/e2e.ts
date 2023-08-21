import type { Test } from 'supertest';
import request from 'supertest'
import type { ApplicationRunHandler } from '@helsingborg-stad/gdi-api-node/application'
import type { Services } from '../types'
import type { Advert } from '../adverts/types'
import type { LoginRequestEntry} from '../login/in-memory-login-service/in-memory-login-service';
import { createInMemoryLoginService } from '../login/in-memory-login-service/in-memory-login-service'
import { createTestApp, createTestServices } from './test-app'
import { createInMemoryAdvertsRepository } from '../adverts/in-memory-adverts-repository'
import type { TokenService } from '../tokens/types'
import { createInMemoryProfileRepository } from '../profile'
import type { Profile } from '../profile/types'
import type { HaffaUser } from '../login/types'
import { createInMemoryUserMapper } from '../users';
import { type UserMapper } from '../users/types';

const createGqlRequest = (tokens: TokenService, server: Parameters<ApplicationRunHandler>[0], user: HaffaUser) => 
	(query: string, variables: any): Test => 
		request(server)
			.post('/api/v1/haffa/graphql')
			.set({
				authorization: `Bearer ${tokens.sign(user)}`,
			})
			.send({ query, variables })

export interface End2EndTestContext {
	user: HaffaUser,
	gqlRequest: ReturnType<typeof createGqlRequest>,
	server: Parameters<ApplicationRunHandler>[0],
	services: Services,
	adverts: Record<string, Advert>
	profiles: Record<string, Profile>,
	logins: Record<string, LoginRequestEntry>
}

export interface End2EndTestHandler {
	(context: End2EndTestContext): Promise<void>
}
export const end2endTest = (
	config: {
		user?: HaffaUser,
		services: Partial<Services>
	} | null,
	handler: End2EndTestHandler
): Promise<void> => {
	const user: HaffaUser = config?.user || { id: 'test@user.com', roles: [] }
	const adverts: Record<string, Advert> = {}
	const logins: Record<string, LoginRequestEntry> = {}
	const profiles: Record<string, Profile> = {}
	const userMapper: UserMapper = config?.services?.userMapper || createInMemoryUserMapper('')
	const services = createTestServices({
		userMapper,
		adverts: createInMemoryAdvertsRepository(adverts),
		profiles: createInMemoryProfileRepository(profiles),
		login: createInMemoryLoginService(userMapper, { db: logins }),
		...config?.services,
	})

	return createTestApp(services)
		.run(async server => handler({
			user,
			gqlRequest: createGqlRequest(services.tokens, server, user),
			server,
			services,
			adverts,
			profiles,
			logins,
		}))
}
