import { normalizeAdvertClaims } from './advert-mutations/mappers'
import {
  createEmptyAdvertInput,
  createPagedAdvertList,
  mapCreateAdvertInputToAdvert,
} from './mappers'
import { AdvertClaimType } from './types'
import type { Advert, AdvertClaim } from './types'

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
    events: [],
    ...claim,
  })
  const collect = (claim: Partial<AdvertClaim>): AdvertClaim => ({
    by: '',
    at: new Date().toDateString(),
    type: AdvertClaimType.collected,
    quantity: 1,
    events: [],
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

describe('createPagedAdvertList', () => {
  const adverts: Advert[] = [
    { id: '0' } as Advert,
    { id: '10' } as Advert,
    { id: '20' } as Advert,
    { id: '30' } as Advert,
    { id: '40' } as Advert,
    { id: '50' } as Advert,
    { id: '60' } as Advert,
    { id: '70' } as Advert,
    { id: '80' } as Advert,
    { id: '90' } as Advert,
  ]

  it('returns all if no CURSOR or limit', () => {
    const result = createPagedAdvertList(adverts)

    expect(result.adverts).toEqual(adverts)
    expect(result.paging.totalCount).toBe(adverts.length)
  })

  it('returns LIMIT amount of adverts normally', () => {
    const result = createPagedAdvertList(adverts, {
      paging: { limit: 5 },
    })

    expect(result.adverts).toHaveLength(5)
    expect(result.adverts).toEqual(adverts.slice(0, 5))
    expect(result.paging.totalCount).toBe(adverts.length)
  })

  it('returns less than LIMIT when at end', () => {
    const result = createPagedAdvertList(adverts, {
      paging: { limit: 15 },
    })

    expect(result.adverts).toHaveLength(10)
    expect(result.adverts).toEqual(adverts)
    expect(result.paging.totalCount).toBe(adverts.length)
  })

  it('starts from CURSOR', () => {
    const result = createPagedAdvertList(adverts, {
      paging: { limit: 5, cursor: '20' },
    })

    expect(result.adverts).toEqual(adverts.slice(2, 7))
    expect(result.paging.totalCount).toBe(adverts.length)
  })

  it('starts from beginning for invalid CURSOR', () => {
    const result = createPagedAdvertList(adverts, {
      paging: { limit: 5, cursor: 'bad cursor' },
    })

    expect(result.adverts).toEqual(adverts.slice(0, 5))
    expect(result.paging.totalCount).toBe(adverts.length)
  })

  it('ignores LIMIT if invalid', () => {
    const result = createPagedAdvertList(adverts, {
      paging: { limit: -100 },
    })

    expect(result.adverts).toEqual(adverts)
    expect(result.paging.totalCount).toBe(adverts.length)
  })

  it('returns the CURSOR of the next', () => {
    const result = createPagedAdvertList(adverts, { paging: { limit: 5 } })

    expect(result.paging.nextCursor).toBe(adverts[5].id)
    expect(result.paging.totalCount).toBe(adverts.length)
  })

  it('returns no CURSOR for last page', () => {
    const result = createPagedAdvertList(adverts, { paging: { limit: 50 } })

    expect(result.paging.nextCursor).toBeUndefined()
    expect(result.paging.totalCount).toBe(adverts.length)
  })

  it('continues as expected when adverts are added before cursor', () => {
    const firstResult = createPagedAdvertList(adverts, { paging: { limit: 5 } })
    const modifiedAdverts: Advert[] = [
      ...adverts.slice(0, 3),
      { id: '25' } as Advert,
      ...adverts.slice(3),
    ]

    const result = createPagedAdvertList(modifiedAdverts, {
      paging: { cursor: firstResult.paging.nextCursor, limit: 5 },
    })

    expect(result.adverts).toEqual(modifiedAdverts.slice(6))
    expect(result.paging.totalCount).toBe(modifiedAdverts.length)
  })

  it('continues as expected when adverts are added after cursor', () => {
    const firstResult = createPagedAdvertList(adverts, { paging: { limit: 5 } })
    const modifiedAdverts: Advert[] = [
      ...adverts.slice(0, 7),
      { id: '65' } as Advert,
      ...adverts.slice(7),
    ]

    const result = createPagedAdvertList(modifiedAdverts, {
      paging: { cursor: firstResult.paging.nextCursor, limit: 5 },
    })

    expect(result.adverts).toEqual(modifiedAdverts.slice(5, 10))
    expect(result.paging.totalCount).toBe(modifiedAdverts.length)
  })

  it('continues as expected when adverts are removed before cursor', () => {
    const firstResult = createPagedAdvertList(adverts, { paging: { limit: 5 } })
    const modifiedAdverts: Advert[] = [
      ...adverts.slice(0, 3),
      ...adverts.slice(4),
    ]

    const result = createPagedAdvertList(modifiedAdverts, {
      paging: { cursor: firstResult.paging.nextCursor, limit: 5 },
    })

    expect(result.adverts).toEqual(modifiedAdverts.slice(4))
    expect(result.paging.totalCount).toBe(modifiedAdverts.length)
  })

  it('continues as expected when adverts are removed after cursor', () => {
    const firstResult = createPagedAdvertList(adverts, { paging: { limit: 5 } })
    const modifiedAdverts: Advert[] = [
      ...adverts.slice(0, 7),
      ...adverts.slice(8),
    ]

    const result = createPagedAdvertList(modifiedAdverts, {
      paging: { cursor: firstResult.paging.nextCursor, limit: 5 },
    })

    expect(result.adverts).toEqual(modifiedAdverts.slice(5))
    expect(result.paging.totalCount).toBe(modifiedAdverts.length)
  })
})
