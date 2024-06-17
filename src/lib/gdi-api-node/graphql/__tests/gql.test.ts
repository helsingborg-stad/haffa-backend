import jwt from 'jsonwebtoken'
import request from 'supertest'
import { createTestApp } from './test-app'
import { StatusCodes } from 'http-status-codes'

const TEST_SHARED_SECRET = 'shared secret for test'

const createAuthorizationHeadersFor = (id: string, secret: string = TEST_SHARED_SECRET) => ({
	authorization: `Bearer ${jwt.sign({ id }, secret)}`,
})

describe('GraphQL', () => {
	it('POST /api/v1/test/graphql handles combinations of sync/async/promise resolvers', () => createTestApp(TEST_SHARED_SECRET)
		.run(async server => {
			const { status, body: { data, errors } } = await request(server)
				.post('/api/v1/test/graphql')
				.set(createAuthorizationHeadersFor('abc-123'))
				.send({
					variables: {},
					query: `
						query ASP {
							combinationsOfSynAsyncPromise {syncId, asyncId, promiseId, asyncPromiseId}
						}
					`,
				})
			
			expect(status).toBe(StatusCodes.OK)
			expect(errors).toBeFalsy()
			expect(data).toMatchObject({
				combinationsOfSynAsyncPromise: {
					syncId: 'abc-123',
					asyncId: 'abc-123',
					promiseId: 'abc-123',
					asyncPromiseId: 'abc-123',
				},
			})
		}))

	it('POST /api/v1/test/graphql validates parameters ({query, variables} = body)', () => createTestApp(TEST_SHARED_SECRET)
		.run(async server => {
			const { status, body: { data } } = await request(server)
				.post('/api/v1/test/graphql')
				.set(createAuthorizationHeadersFor('test-person-id-123'))
				.send({
					query: `
                        query TestQuery {
                            testData {
                                idFromToken
                            }
                        }`,
					variables: {},
				})
			expect(status).toBe(StatusCodes.OK)
			expect(data).toMatchObject({
				testData: {
					idFromToken: 'test-person-id-123',
				},
			})
		}))

	it('POST /api/v1/test/graphql validates parameters ({query, variables} = body)', () => createTestApp(TEST_SHARED_SECRET)
		.run(async server => {
			const { status } = await request(server)
				.post('/api/v1/test/graphql')
				.set(createAuthorizationHeadersFor('test-person-id-123'))
				.send({ 'the-body-is': 'missing query and variables' })
                
			expect(status).toBe(StatusCodes.BAD_REQUEST)
		}))

	it('POST /api/v1/test/graphql requires valid authorization header', () => createTestApp(TEST_SHARED_SECRET)
		.run(async server => {
			const { status } = await request(server)
				.post('/api/v1/test/graphql')
                
				.send({ query: 'a', variables: {} })
                
			expect(status).toBe(StatusCodes.UNAUTHORIZED)
		}))

	it('POST /api/v1/test/graphql can utilize cache in implementation', () => createTestApp(TEST_SHARED_SECRET)
		.run(async server => {
			const { status, body: { data } } = await request(server)
				.post('/api/v1/test/graphql')
				.set(createAuthorizationHeadersFor('test-person-id-123'))
				.send({
					query: `
						query TestQuery($n: Int!, $idValue: String!) {
							cachedComputedEntries(n: $n, idValue: $idValue) {
								id
							}
                        }`,
					variables: { n: 3, idValue: 'testid' },
				})
                
			expect(status).toBe(StatusCodes.OK)
			expect(data).toMatchObject({
				cachedComputedEntries: [ {
					id: 'testid',
				},{
					id: 'testid',
				},{
					id: 'testid',
				} ],
			})
		}))

})


 