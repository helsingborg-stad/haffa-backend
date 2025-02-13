import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { TxErrors } from '../../../transactions'
import { createEmptyAdvert } from '../../mappers'
import { AdvertClaimType } from '../../types'
import type { AdvertMutationResult } from '../../types'
import { mutationProps } from '../test-utils/gql-test-definitions'

const returnAdvertMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!
) {
	returnAdvert(id: $id) {
		${mutationProps}
	}
}
`

describe('returnAdvert', () => {
  it('removes collect claim and notifies', () => {
    const advertWasReturned = jest.fn(async () => undefined)
    const advertWasReturnedOwner = jest.fn(async () => undefined)
    const notifications = createTestNotificationServices({
      advertWasReturned,
      advertWasReturnedOwner,
    })

    return end2endTest(
      { services: { notifications } },
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canManageReturns'],
          },
        ])

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: 'owner@test.com',
          quantity: 5,
          claims: [
            {
              type: AdvertClaimType.collected,
              by: 'collector@test.com',
              quantity: 1,
              at: new Date().toISOString(),
              events: [],
            },
          ],
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'returnAdvert',
          returnAdvertMutation,
          {
            id: 'advert-123',
          }
        )
        expect(result.status).toBeNull()
        expect(adverts['advert-123']).toMatchObject(result.advert!)

        T('should have collect logged in database', () =>
          expect(adverts['advert-123'].claims).toHaveLength(0)
        )

        T('should have notified about the interesting event', () =>
          expect(advertWasReturned).toHaveBeenCalledWith(
            'collector@test.com',
            expect.objectContaining(user),
            1,
            adverts['advert-123']
          )
        )
        T('should have notified about the interesting event', () =>
          expect(advertWasReturnedOwner).toHaveBeenCalledWith(
            'owner@test.com',
            expect.objectContaining(user),
            1,
            adverts['advert-123']
          )
        )
      }
    )
  })

  it('denies when no collects exists', () =>
    end2endTest(
      {},
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canManageReturns'],
          },
        ])

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: 'owner@test.com',
          quantity: 5,
          claims: [], // NO CLAIMS
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'returnAdvert',
          returnAdvertMutation,
          {
            id: 'advert-123',
          }
        )
        expect(result.status).toMatchObject(TxErrors.Unauthorized)
      }
    ))

  it('denies when multiple collects exists', () =>
    end2endTest(
      {},
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canManageReturns'],
          },
        ])

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: 'owner@test.com',
          quantity: 5,
          claims: [
            {
              type: AdvertClaimType.collected,
              by: 'collector1@test.com',
              quantity: 1,
              at: new Date().toISOString(),
              events: [],
            },
            {
              type: AdvertClaimType.collected,
              by: 'collector2@test.com',
              quantity: 1,
              at: new Date().toISOString(),
              events: [],
            },
          ],
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'returnAdvert',
          returnAdvertMutation,
          {
            id: 'advert-123',
          }
        )
        expect(result.status).toMatchObject(TxErrors.Unauthorized)
      }
    ))
  it('should set unpicked on return', () => {
    const advertWasReturned = jest.fn(async () => undefined)
    const advertWasReturnedOwner = jest.fn(async () => undefined)
    const notifications = createTestNotificationServices({
      advertWasReturned,
      advertWasReturnedOwner,
    })
    const workflow = {
      get pickOnCollect() {
        return true
      },
      get unpickOnReturn() {
        return true
      },
    }
    const spy = jest.spyOn(workflow, 'unpickOnReturn', 'get')

    return end2endTest(
      { services: { notifications, workflow } },
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        // give us rights to collect
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canManageReturns'],
          },
        ])

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: 'owner@test.com',
          pickedAt: '2025-01-01T00:00:00:000Z',
          quantity: 5,
          claims: [
            {
              type: AdvertClaimType.collected,
              by: 'collector@test.com',
              quantity: 1,
              at: new Date().toISOString(),
              events: [],
            },
          ],
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'returnAdvert',
          returnAdvertMutation,
          {
            id: 'advert-123',
          }
        )
        expect(result.status).toBeNull()

        T('should be updated in database', () =>
          expect(adverts['advert-123'].pickedAt).toBe('')
        )

        T('should have checked configuration', () =>
          expect(spy).toHaveBeenCalled()
        )
      }
    )
  })
})
