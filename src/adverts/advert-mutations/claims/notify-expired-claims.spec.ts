import { createExpiredClaimsNotifier, createReservedClaimsNotifier } from '.'
import { end2endTest } from '../../../test-utils'
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
})
