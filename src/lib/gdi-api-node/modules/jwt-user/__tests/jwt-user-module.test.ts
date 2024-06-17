import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { createApplication } from '../../../application'
import type { AuthorizationService } from '../../../services/authorization-service'
import { createAuthorizationService } from '../../../services/authorization-service'
import { jwtUserModule } from '..'
import { getOpenApiDefinitionPathForTest } from '../../../__tests/test-utils'

const createTestApp = (authorization: AuthorizationService) =>
  createApplication({
    openApiDefinitionPath: getOpenApiDefinitionPathForTest(),
    validateResponse: true,
  }).use(jwtUserModule(authorization))

describe('jwt-user-module', () => {
  it('ignores apa', async () =>
    createTestApp(createAuthorizationService('test shared secret')).run(
      async server => {
        const { status } = await request(server)
          .get('/some/page/it/can/be/anyone/actally')
          .set('Authorization', 'Bearer apa')
        expect(status).toBe(StatusCodes.UNAUTHORIZED)
      }
    ))
})
