import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertMutationResult } from '../../types'
import { AdvertClaimType } from '../../types'
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
    const advertWasCollected = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertWasCollected,
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
            roles: ['canManageOwnAdvertsHistory'],
          },
        ])
        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: user.id,
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
              by: user.id,
              at: '',
              quantity: 1,
              type: AdvertClaimType.reserved,
              events: [],
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
            by: user.id,
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
            },
            {
              by: 'someone else',
              at: '',
              quantity: 1,
              type: 'reserved',
            },
            {
              by: user.id,
              // at: '',
              quantity: 1,
              type: AdvertClaimType.collected,
            },
          ])
        )

        T('should have notified about the interesting event', () =>
          expect(advertWasCollected).toHaveBeenCalledWith(
            user,
            1,
            adverts['advert-123']
          )
        )
      }
    )
  })
})
