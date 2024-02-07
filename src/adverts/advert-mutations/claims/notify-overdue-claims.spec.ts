import { end2endTest } from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import { AdvertClaimEventType, AdvertClaimType } from '../../types'
import { createOverdueClaimsNotifier } from './notify-overdue-claims'

describe('notifyOverdueClaims', () => {
  it('should add events when overdue)', () =>
    end2endTest({}, async ({ user, adverts, services }) => {
      // eslint-disable-next-line no-param-reassign
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        id: 'advert-123',
        createdBy: user.id,
        quantity: 50,
        lendingPeriod: 1,
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
            at: '2023-05-01T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.collected,
            events: [
              {
                type: AdvertClaimEventType.reminder,
                at: '2023-05-02T00:00:00.000Z',
              },
            ],
          },
          {
            by: 'jane@doe3.se',
            at: '2023-05-01T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.collected,
            events: [],
          },
          {
            by: 'jane@doe4.se',
            at: '2023-05-02T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.collected,
            events: [],
          },
          {
            by: 'jane@doe5.se',
            at: '2023-05-03T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.collected,
            events: [],
          },
          {
            by: 'jane@doe6.se',
            at: '2023-05-04T00:00:00.000Z',
            quantity: 2,
            type: AdvertClaimType.collected,
            events: [],
          },
        ],
      }
      const notifyOverdueClaims = createOverdueClaimsNotifier(services)

      const result = await notifyOverdueClaims(
        user,
        'advert-123',
        1,
        new Date('2023-05-03T00:00:00.000Z')
      )

      expect(result.advert?.claims[0].events).toEqual([])
      expect(result.advert?.claims[1].events).toEqual([
        { at: '2023-05-02T00:00:00.000Z', type: 'reminder' },
        { at: '2023-05-03T00:00:00.000Z', type: 'reminder' },
      ])
      expect(result.advert?.claims[2].events).toEqual([
        { at: '2023-05-03T00:00:00.000Z', type: 'reminder' },
      ])
      expect(result.advert?.claims[3].events).toEqual([])
      expect(result.advert?.claims[4].events).toEqual([])
      expect(result.advert?.claims[5].events).toEqual([])
    }))
})
