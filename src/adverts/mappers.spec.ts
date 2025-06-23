import {
  createEmptyAdvertInput,
  createPagedAdvertList,
  mapCreateAdvertInputToAdvert,
  normalizeAdvertSummaries,
} from './mappers'
import type { Advert, AdvertSummaries } from './types'

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

describe('createPagedAdvertList', () => {
  const adverts: Advert[] = [...Array(12)].map(
    (_, index) =>
      ({
        id: (index * 10).toString(),
      } as Advert)
  )

  it('returns upper bound if no CURSOR or limit', () => {
    const upperBound = 5
    const result = createPagedAdvertList(adverts, undefined, {
      defaultPageSize: upperBound,
      maxCount: 100,
    })

    expect(result.adverts).toEqual(adverts.slice(0, upperBound))
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

  it('has upper bound on LIMIT', () => {
    const hardLimit = 10
    const result = createPagedAdvertList(
      adverts,
      {
        paging: { limit: 15 },
      },
      { defaultPageSize: 1, maxCount: hardLimit }
    )

    expect(result.adverts).toHaveLength(10)
    expect(result.adverts).toEqual(adverts.slice(0, hardLimit))
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

    expect(result.adverts).toEqual(modifiedAdverts.slice(6, 11))
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

    expect(result.adverts).toEqual(modifiedAdverts.slice(4, 9))
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

    expect(result.adverts).toEqual(modifiedAdverts.slice(5, 10))
    expect(result.paging.totalCount).toBe(modifiedAdverts.length)
  })

  it('normalizeAdvertSummmaries() detects negative and NaN and non numbers', () => {
    expect(
      normalizeAdvertSummaries({
        totalLendingAdverts: -1,
        totalRecycleAdverts: NaN,
        availableLendingAdverts: 'not a number',
        availableAdverts: 10,
      } as any as AdvertSummaries)
    ).toMatchObject({
      totalLendingAdverts: 0,
      totalRecycleAdverts: 0,
      availableLendingAdverts: 0,
      availableAdverts: 10,
    })
  })
})
