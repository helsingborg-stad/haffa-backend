import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertMutationResult } from '../../types'
import { AdvertClaimEventType, AdvertClaimType } from '../../types'
import { mutationProps } from '../test-utils/gql-test-definitions'

const convertAdvertClaimMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!,
	$by: String!,
	$type: AdvertClaimType!
  $newType: AdvertClaimType!
) {
	convertAdvertClaim(id: $id, by: $by, type: $type, newType: $newType) {
		${mutationProps}
	}
}
`
describe('convertAdvertClaim', () => {
  it('can convert reservation to collect', () => {
    const advertWasCollected = jest.fn(async () => undefined)
    const advertWasCollectedOwner = jest.fn(async () => undefined)
    const notifications = createTestNotificationServices({
      advertWasCollected,
      advertWasCollectedOwner,
    })
    return end2endTest(
      {
        services: { notifications },
      },
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        // give us rights to handle claims
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canManageOwnAdvertsHistory', 'canManageAllAdverts'],
          },
        ])
        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: 'some@owner',
          quantity: 50,
          claims: [
            {
              by: 'someone I used to know',
              at: '',
              quantity: 2,
              type: AdvertClaimType.reserved,
              events: [],
            },
            {
              by: 'claims@user',
              at: '',
              quantity: 1,
              type: AdvertClaimType.reserved,
              events: [
                {
                  type: AdvertClaimEventType.reminder,
                  at: '',
                },
              ],
            },
            {
              by: 'someone else',
              at: '',
              quantity: 1,
              type: AdvertClaimType.reserved,
              events: [],
            },
          ],
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'convertAdvertClaim',
          convertAdvertClaimMutation,
          {
            id: 'advert-123',
            by: 'claims@user',
            type: AdvertClaimType.reserved,
            newType: AdvertClaimType.collected,
          }
        )
        expect(result.status).toBeNull()

        T('claim should be updated in database', () =>
          expect(adverts['advert-123'].claims).toMatchObject([
            {
              by: 'someone I used to know',
              at: '',
              quantity: 2,
              type: 'reserved',
              events: [],
            },
            {
              by: 'someone else',
              at: '',
              quantity: 1,
              type: 'reserved',
              events: [],
            },
            {
              by: 'claims@user',
              // at: '',
              quantity: 1,
              type: AdvertClaimType.collected,
              events: [],
            },
          ])
        )
        T('should update collectedAt', () =>
          expect(adverts['advert-123'].collectedAt).toHaveLength(
            new Date().toISOString().length
          )
        )

        T('should have notified about the interesting event', () => {
          expect(advertWasCollected).toHaveBeenCalledWith(
            'claims@user',
            expect.objectContaining(user),
            1,
            adverts['advert-123'],
            null
          )
        })
        T('should have notified about the interesting event', () => {
          expect(advertWasCollectedOwner).toHaveBeenCalledWith(
            'some@owner',
            expect.objectContaining(user),
            1,
            adverts['advert-123'],
            null
          )
        })
      }
    )
  })
})
describe('convertAdvertClaim - picking', () => {
  it('should set picked at collect', () => {
    const advertWasCollected = jest.fn(async () => undefined)
    const advertWasCollectedOwner = jest.fn(async () => undefined)
    const notifications = createTestNotificationServices({
      advertWasCollected,
      advertWasCollectedOwner,
    })
    const workflow = {
      get pickOnCollect() {
        return true
      },
      get unpickOnReturn() {
        return false
      },
    }
    const spy = jest.spyOn(workflow, 'pickOnCollect', 'get')

    return end2endTest(
      {
        services: { notifications, workflow },
      },
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        // give us rights to handle claims
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canManageOwnAdvertsHistory', 'canManageAllAdverts'],
          },
        ])
        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: 'some@owner',
          quantity: 50,
          claims: [
            {
              by: 'claims@user',
              at: '',
              quantity: 2,
              type: AdvertClaimType.reserved,
              events: [],
            },
          ],
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'convertAdvertClaim',
          convertAdvertClaimMutation,
          {
            id: 'advert-123',
            by: 'claims@user',
            type: AdvertClaimType.reserved,
            newType: AdvertClaimType.collected,
          }
        )
        expect(result.status).toBeNull()

        T('advert should be updated in database', () =>
          expect(adverts['advert-123'].pickedAt).toHaveLength(
            '2025-01-17T13:35:25.725Z'.length
          )
        )
        T('should have checked configuration', () =>
          expect(spy).toHaveBeenCalled()
        )
      }
    )
  })
})
