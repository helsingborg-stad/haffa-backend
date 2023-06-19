import * as jwt from 'jsonwebtoken'
import * as request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { createApp } from '../../create-app'
import { Application } from '@helsingborg-stad/gdi-api-node'
import { createAuthorizationService } from '@helsingborg-stad/gdi-api-node/services/authorization-service'

const TEST_SHARED_SECRET = 'shared secret for test'

const createAuthorizationHeadersFor = (id: string, secret: string = TEST_SHARED_SECRET) => ({
	authorization: `Bearer ${jwt.sign({ id }, secret)}`,
})

const createTestApp = (): Application => createApp({
	services: {
		authorization: createAuthorizationService(TEST_SHARED_SECRET),
	},
	validateResponse: true,
})

describe('GraphQL endpoint /api/v1/hello-world/graphql', () => {
	it('works...', () => createTestApp()
		.run(async server => {
			const { status, body: { data } } = await request(server)
				.post('/api/v1/hello-world/graphql')
				.set(createAuthorizationHeadersFor('test-person-id-123'))
				.send({
					query: `
                        query TestQuery {
                            hello {
                                world
                            }
                        }`,
					variables: {},

				})
			expect(status).toBe(StatusCodes.OK)
			expect(data).toMatchObject({
				hello: {
					world: 'Hello test-person-id-123',
				},
			})
		}))
})


 