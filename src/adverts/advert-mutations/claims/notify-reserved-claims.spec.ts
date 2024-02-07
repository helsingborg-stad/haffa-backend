import { createReservedClaimsNotifier } from '.'
import { end2endTest } from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import { AdvertClaimEventType, AdvertClaimType } from '../../types'

describe('notifyReservedClaims', () => {
  it('should add an event when no prior event exists using datecomparison with the claim creation date)', () =>
    end2endTest({}, async ({ user, adverts, services }) => {
      // eslint-disable-next-line no-param-reassign
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        id: 'advert-123',
        createdBy: user.id,
        quantity: 50,
        claims: [
          {
            by: user.id,
            at: '2023-05-01T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.reserved,
            events: [],
          },
        ],
      }
      const notifyAdvertClaim = createReservedClaimsNotifier(services)

      await notifyAdvertClaim(
        user,
        'advert-123',
        10,
        new Date('2023-06-01T00:00:00.000Z')
      )
      expect(adverts['advert-123'].claims[0].events).toMatchObject([
        {
          type: AdvertClaimEventType.reminder,
          at: '2023-06-01T00:00:00.000Z',
        },
      ])
    }))
  it('should add a reminder to event array when prior events exists using datecomparison with the previous event)', () =>
    end2endTest({}, async ({ user, adverts, services }) => {
      // eslint-disable-next-line no-param-reassign
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        id: 'advert-123',
        createdBy: user.id,
        quantity: 50,
        claims: [
          {
            by: user.id,
            at: '2023-05-01T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.reserved,
            events: [
              {
                type: AdvertClaimEventType.reminder,
                at: '2023-05-10T00:00:00.000Z',
              },
            ],
          },
        ],
      }
      const notifyAdvertClaim = createReservedClaimsNotifier(services)

      await notifyAdvertClaim(
        user,
        'advert-123',
        10,
        new Date('2023-05-20T00:00:00.000Z')
      )

      expect(adverts['advert-123'].claims[0].events).toMatchObject([
        {
          at: '2023-05-10T00:00:00.000Z',
          type: AdvertClaimEventType.reminder,
        },
        {
          at: '2023-05-20T00:00:00.000Z',
          type: AdvertClaimEventType.reminder,
        },
      ])
    }))
})
