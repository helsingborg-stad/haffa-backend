import { normalizeAdvertClaims } from './advert-mutations/mappers'
import { createEmptyAdvertInput, mapCreateAdvertInputToAdvert } from './mappers'
import { AdvertClaim, AdvertClaimType } from './types'

describe('mapCreateAdvertInputToAdvert', () => {
  it('should set input field, user and timestamps', () => {
    const advert = mapCreateAdvertInputToAdvert(
      {
        ...createEmptyAdvertInput(),
        title: 'the title',
        description: 'the description',
        unit: 'u',
        material: 'm',
        condition: 'c',
        usage: 'us',
        images: [],
      },
      {
        id: 'the@user',
      },
      '2023-06-26'
    )
    expect(advert).toMatchObject({
      title: 'the title',
      description: 'the description',
      createdBy: 'the@user',
      createdAt: '2023-06-26',
      unit: 'u',
      material: 'm',
      condition: 'c',
      usage: 'us',
    })

    expect(advert.id.length).toBeGreaterThan(32)
  })
})

describe('normalizeAdvertsClaims', () => {
  const reserve = (claim: Partial<AdvertClaim>): AdvertClaim => ({
    by: '',
    at: new Date().toDateString(),
    type: AdvertClaimType.reserved,
    quantity: 1,
    ...claim,
  })
  const collect = (claim: Partial<AdvertClaim>): AdvertClaim => ({
    by: '',
    at: new Date().toDateString(),
    type: AdvertClaimType.collected,
    quantity: 1,
    ...claim,
  })

  it('merges entries by owner and type', () => {
    expect(
      normalizeAdvertClaims([
        reserve({ by: 'a', quantity: 2 }),
        collect({ by: 'a' }),
        reserve({ by: 'b' }),
        reserve({ by: 'a', quantity: 3 }),
      ])
    ).toMatchObject([
      reserve({ by: 'a', quantity: 5 }),
      collect({ by: 'a' }),
      reserve({ by: 'b' }),
    ])
  })

  it('removes entries with 0 quantity', () => {
    expect(
      normalizeAdvertClaims([
        reserve({ by: 'a', quantity: 0 }),
        collect({ by: 'a' }),
        reserve({ by: 'b', quantity: 0 }),
        reserve({ by: 'a', quantity: 3 }),
      ])
    ).toMatchObject([collect({ by: 'a' }), reserve({ by: 'a', quantity: 3 })])
  })
})
