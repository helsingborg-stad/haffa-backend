import { StatusCodes } from 'http-status-codes'
import request from 'supertest'
import type { SwaggerModuleProps } from '..'
import { swaggerModule } from '..'
import { createApplication } from '../../../application'
import { getOpenApiDefinitionPathForTest } from '../../../__tests/test-utils'

const createTestApp = (props?: SwaggerModuleProps) =>
  createApplication({
    openApiDefinitionPath: getOpenApiDefinitionPathForTest(),
    validateResponse: true,
  }).use(swaggerModule(props))

describe('swagger-module', () => {
  it('GET /swagger.json responds with JSON', async () =>
    createTestApp().run(async server => {
      const { headers, status } = await request(server)
        .get('/swagger.json')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(StatusCodes.OK)
    }))
  it('GET / redirects to /swagger', async () =>
    createTestApp().run(async server => {
      const { status, headers } = await request(server).get('/')
      expect(status).toBe(StatusCodes.MOVED_TEMPORARILY)
      expect(headers.location).toBe('/swagger')
    }))
  it('GET /swagger responds with HTML', async () =>
    createTestApp().run(async server => {
      const { status, headers } = await request(server).get('/swagger')
      expect(status).toBe(StatusCodes.OK)
      expect(headers['content-type']).toMatch(/html/)
    }))
})

describe('swagger-module, routePrefix=/api/v1/test', () => {
  it('GET /api/v1/test/swagger.json responds with JSON', async () =>
    createTestApp({ routePrefix: '/api/v1/test' }).run(async server => {
      const { headers, status } = await request(server)
        .get('/api/v1/test.json')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(StatusCodes.OK)
    }))
  it('GET / redirects to /api/v1/test', async () =>
    createTestApp({ routePrefix: '/api/v1/test' }).run(async server => {
      const { status, headers } = await request(server).get('/')
      expect(status).toBe(StatusCodes.MOVED_TEMPORARILY)
      expect(headers.location).toBe('/api/v1/test')
    }))
  it('GET /api/v1/test/swagger responds with HTML', async () =>
    createTestApp({ routePrefix: '/api/v1/test' }).run(async server => {
      const { status, headers } = await request(server).get('/api/v1/test')
      expect(status).toBe(StatusCodes.OK)
      expect(headers['content-type']).toMatch(/html/)
    }))
})
