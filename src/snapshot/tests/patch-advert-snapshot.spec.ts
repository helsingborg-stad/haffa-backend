import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import type { End2EndTestHandler } from '../../test-utils'
import { end2endTest } from '../../test-utils'
import { createEmptyAdvert } from '../../adverts/mappers'
import { sortBy } from '../../lib'
import type { LoginPolicy } from '../../login-policies/types'
import type { Advert } from '../../adverts/types'

const setupTestLoginPolicyForTestUser =
  (p: Partial<LoginPolicy>): End2EndTestHandler =>
  async ({ user, loginPolicies }) => {
    await loginPolicies.updateLoginPolicies([
      {
        emailPattern: user.id,
        roles: [],
        ...p,
      },
    ])
  }

const setupTestAdverts =
  (...adverts: Advert[]): End2EndTestHandler =>
  async ({ adverts: repo }) => {
    adverts.forEach(a => {
      // eslint-disable-next-line no-param-reassign
      repo[a.id] = a
    })
  }

describe('/api/v1/haffa/snapshot/adverts', () => {
  it('denies if role canRunSystemJobs is missing', () =>
    end2endTest(
      null,
      setupTestLoginPolicyForTestUser({}),
      async ({ user, server, services: { tokens } }) => {
        const { status } = await request(server)
          .patch('/api/v1/haffa/snapshot/adverts')
          .set({
            authorization: `Bearer ${tokens.sign(user)}`,
          })
          .send({
            snapshot: 'adverts',
            adverts: [],
          })
        expect(status).toBe(StatusCodes.UNAUTHORIZED)
      }
    ))

  it('imports missing adverts only', () =>
    end2endTest(
      null,
      setupTestLoginPolicyForTestUser({
        roles: ['canRunSystemJobs', 'canEditOwnAdverts', 'canManageAllAdverts'],
      }),
      setupTestAdverts(
        createEmptyAdvert({
          id: 'a1',
          title: 'A1',
        })
      ),
      async ({ user, server, adverts, services: { tokens } }) => {
        const { status } = await request(server)
          .patch('/api/v1/haffa/snapshot/adverts')
          .set({
            authorization: `Bearer ${tokens.sign(user)}`,
          })
          .send({
            snapshot: 'adverts',
            adverts: [
              createEmptyAdvert({ id: 'a0', title: 'A0 new' }),
              createEmptyAdvert({ id: 'a1', title: 'A1 changed' }),
              createEmptyAdvert({ id: 'a2', title: 'A2 new' }),
            ],
          })
        expect(status).toBe(StatusCodes.OK)

        expect(
          Object.values(adverts)
            .sort(sortBy(({ id }) => id))
            .map(({ id, title }) => ({ id, title }))
        ).toMatchObject([
          { id: 'a0', title: 'A0 new' },
          { id: 'a1', title: 'A1' },
          { id: 'a2', title: 'A2 new' },
        ])
      }
    ))

  it('rejects malformed adverts', () =>
    end2endTest(
      null,
      setupTestLoginPolicyForTestUser({
        roles: ['canRunSystemJobs', 'canEditOwnAdverts', 'canManageAllAdverts'],
      }),
      async ({ user, server, adverts, services: { tokens } }) => {
        const { status } = await request(server)
          .patch('/api/v1/haffa/snapshot/adverts')
          .set({
            authorization: `Bearer ${tokens.sign(user)}`,
          })
          .send({
            snapshot: 'adverts',
            adverts: [
              {
                id: 'a',
                a_lot_of_properties_are_missing: {},
              },
            ],
          })
        expect(status).toBe(StatusCodes.BAD_REQUEST)

        expect(Object.values(adverts)).toMatchObject([])
      }
    ))
})
