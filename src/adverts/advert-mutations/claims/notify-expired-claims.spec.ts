import { createExpiredClaimsNotifier } from '.'
import {
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import { AdvertClaimType } from '../../types'

describe('notifyExpiredClaims', () => {
  it('should delete claims older than threshold)', () =>
    end2endTest({}, async ({ user, adverts, services }) => {
      // eslint-disable-next-line no-param-reassign
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        id: 'advert-123',
        createdBy: user.id,
        quantity: 50,
        claims: [
          {
            by: 'jane@doe1.se',
            at: '2023-05-01T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.collected,
            events: [],
          },
          {
            by: 'jane@doe2.se',
            at: '2023-05-01T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.reserved,
            events: [],
          },
          {
            by: 'jane@doe3.se',
            at: '2023-05-02T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.reserved,
            events: [],
          },
          {
            by: 'jane@doe4.se',
            at: '2023-05-03T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.reserved,
            events: [],
          },
          {
            by: 'jane@doe5.se',
            at: '2023-05-04T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.reserved,
            events: [],
          },
        ],
      }
      const notifyExpiredClaims = createExpiredClaimsNotifier(services)

      const result = await notifyExpiredClaims(
        user,
        'advert-123',
        1,
        new Date('2023-05-03T00:00:00.000Z')
      )
      expect(result.advert?.claims).toHaveLength(4)
    }))
  it('should return null when no claim expired)', () =>
    end2endTest({}, async ({ user, adverts, services }) => {
      // eslint-disable-next-line no-param-reassign
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        id: 'advert-123',
        createdBy: user.id,
        quantity: 50,
        claims: [
          {
            by: 'jane@doe1.se',
            at: '2023-05-03T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.reserved,
            events: [],
          },
        ],
      }
      const notifyExpiredClaims = createExpiredClaimsNotifier(services)

      const result = await notifyExpiredClaims(
        user,
        'advert-123',
        1,
        new Date('2023-05-03T00:00:00.000Z')
      )
      expect(result.advert).toBeNull()
    }))
  it('should call notification actions when a claim expired)', () => {
    const advertReservationWasCancelled = jest.fn(async () => undefined)
    const advertReservationWasCancelledOwner = jest.fn(async () => undefined)
    const notifications = createTestNotificationServices({
      advertReservationWasCancelled,
      advertReservationWasCancelledOwner,
    })

    return end2endTest(
      {
        services: { notifications },
      },
      async ({ user, adverts, services }) => {
        const createTestAdvert = () => ({
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: user.id,
          quantity: 50,
          claims: [
            {
              by: 'jane@doe1.se',
              at: '2023-05-01T00:00:00.000Z',
              quantity: 2,
              type: AdvertClaimType.reserved,
              events: [],
            },
            {
              by: 'jane@doe2.se',
              at: '2024-05-01T00:00:00.000Z',
              quantity: 4,
              type: AdvertClaimType.reserved,
              events: [],
            },
          ],
        })
        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = createTestAdvert()

        const notifyExpiredClaims = createExpiredClaimsNotifier(services)

        await notifyExpiredClaims(
          user,
          'advert-123',
          1,
          new Date('2024-05-01T00:00:00.000Z')
        )
        expect(advertReservationWasCancelled).toHaveBeenCalledWith(
          'jane@doe1.se',
          expect.objectContaining(user),
          2,
          createTestAdvert(),
          null
        )
        expect(advertReservationWasCancelledOwner).toHaveBeenCalledWith(
          adverts['advert-123'].createdBy,
          expect.objectContaining(user),
          2,
          createTestAdvert(),
          null
        )
      }
    )
  })
})
