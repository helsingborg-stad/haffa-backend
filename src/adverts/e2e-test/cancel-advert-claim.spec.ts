import { StatusCodes } from 'http-status-codes'
import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../test-utils'
import { createEmptyAdvert } from '../mappers'
import { AdvertClaimType, type AdvertWithMetaMutationResult } from '../types'
import { cancelAdvertClaimMutation } from './queries'

describe('cancelAdvertClaim', () => {
  it('removes all reservations (by user) from database', () => {
    const advertReservationWasCancelled = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertReservationWasCancelled,
    })
    return end2endTest(
      {
        services: { notifications },
      },
      async ({ gqlRequest, adverts, user }) => {
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
            },
            {
              by: user.id,
              at: '',
              quantity: 1,
              type: AdvertClaimType.reserved,
            },
            {
              by: 'someone else',
              at: '',
              quantity: 1,
              type: AdvertClaimType.reserved,
            },
          ],
        }

        const { status, body } = await gqlRequest(cancelAdvertClaimMutation, {
          id: 'advert-123',
          by: user.id,
          type: AdvertClaimType.reserved,
        })
        T('REST call should succeed', () => expect(status).toBe(StatusCodes.OK))

        T('reservations by user should be removed from database', () =>
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
          ])
        )

        T('should have notified about the interesting event', () =>
          expect(advertReservationWasCancelled).toHaveBeenCalledWith(
            user,
            1,
            adverts['advert-123']
          )
        )
      }
    )
  })
})
