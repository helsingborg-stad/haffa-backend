import { createAdvertFilterPredicate } from './advert-filter-predicate'
import { createEmptyAdvert } from '../mappers'
import { AdvertClaimType, type Advert } from '../types'
import type { HaffaUser } from '../../login/types'

describe('createAdvertFilterPredicate', () => {
  const createTestUser = (user?: Partial<HaffaUser>): HaffaUser => ({
    id: 'test@testerson.com',
    roles: [],
    ...user,
  })

  const createSampleAdverts = (
    count: number,
    patches?: Record<string, Partial<Advert>>
  ): Advert[] =>
    [...Array(count)]
      .map(createEmptyAdvert)
      .map((advert, index) => ({ ...advert, id: `advert-${index}` }))
      .map(advert => ({
        ...advert,
        ...patches?.[advert.id],
      }))

  it('matches all by default', () => {
    const adverts = createSampleAdverts(10)
    expect(
      adverts.filter(createAdvertFilterPredicate(createTestUser()))
    ).toMatchObject(adverts)
  })

  it('does free text search in {title, description}', () => {
    const p = createAdvertFilterPredicate(createTestUser(), {
      search: 'unicorn',
    })

    const adverts = createSampleAdverts(100, {
      'advert-10': { title: 'I like my unicorn!' },
      'advert-20': { description: ' UniCorns are the best' },
    })

    expect(adverts.filter(p).map(({ id }) => id)).toMatchObject([
      'advert-10',
      'advert-20',
    ])
  })

  it('treats search text as a list of separate words combined with or to match {title, description}', () => {
    const p = createAdvertFilterPredicate(createTestUser(), {
      search: 'unicorn orange banana',
    })

    const adverts = createSampleAdverts(100, {
      'advert-10': { title: 'I like my unicorn!' },
      'advert-20': { description: 'Oranges are the best' },
      'advert-30': { description: 'my oranges brings unicorns to my yard' },
      'advert-40': { description: 'the amazing banana bender' },
    })

    expect(adverts.filter(p).map(({ id }) => id)).toMatchObject([
      'advert-10',
      'advert-20',
      'advert-30',
      'advert-40',
    ])
  })

  it('combines search text with filter predicates with logical AND', () => {
    const p = createAdvertFilterPredicate(createTestUser(), {
      search: 'unicorn',
      fields: {
        description: {
          contains: 'orange',
        },
      },
    })

    const adverts = createSampleAdverts(100, {
      'advert-10': { title: 'I like my unicorn!' },
      'advert-20': { description: 'Unicorns are the best' },
      'advert-30': {
        title: 'I have an unicorn',
        description: 'I loves oranges',
      },
    })

    expect(adverts.filter(p).map(({ id }) => id)).toMatchObject(['advert-30'])
  })

  it('restricts to creator', () => {
    const p = createAdvertFilterPredicate(createTestUser({ id: 'a@b.com' }), {
      search: 'unicorn',
      restrictions: { createdByMe: true },
    })

    const adverts = createSampleAdverts(100, {
      'advert-10': { title: 'I like my unicorn!' },
      'advert-20': { description: ' UniCorns are the best' },
      'advert-30': {
        description: ' My very own little unicorn',
        createdBy: 'a@b.com',
      },
    })

    expect(adverts.filter(p).map(({ id }) => id)).toMatchObject(['advert-30'])
  })

  it('restricts to reserved by', () => {
    const p = createAdvertFilterPredicate(createTestUser({ id: 'a@b.com' }), {
      search: 'unicorn',
      restrictions: { reservedByMe: true },
    })

    const adverts = createSampleAdverts(100, {
      'advert-10': { title: 'I like my unicorn!' },
      'advert-20': { description: ' UniCorns are the best' },
      'advert-30': {
        description: ' My very own little unicorn',
        claims: [
          {
            by: 'a@b.com',
            at: new Date().toISOString(),
            quantity: 1,
            type: AdvertClaimType.reserved,
          },
        ],
      },
    })

    expect(adverts.filter(p).map(({ id }) => id)).toMatchObject(['advert-30'])
  })

  it('restricts to can be reserved', () => {
    const p = createAdvertFilterPredicate(createTestUser({ id: 'a@b.com' }), {
      search: 'unicorn',
      restrictions: { canBeReserved: true },
    })

    let adverts = createSampleAdverts(100, {
      'advert-10': { title: 'I like my unicorn!' },
      'advert-20': { description: ' UniCorns are the best' },
      'advert-30': { description: ' My very own little unicorn' },
    })

    // reserve all adverts except advert-30
    adverts = adverts.map(advert =>
      advert.id === 'advert-30'
        ? advert
        : {
            ...advert,
            claims: [
              {
                by: 'someone@else',
                at: new Date().toISOString(),
                quantity: advert.quantity,
                type: AdvertClaimType.reserved,
              },
            ],
          }
    )

    expect(adverts.filter(p).map(({ id }) => id)).toMatchObject(['advert-30'])
  })

  it('bugfix: supports exotic characters', () => {
    const p = createAdvertFilterPredicate(createTestUser(), { search: 'ÅÄÖ' })

    const adverts = createSampleAdverts(100, {
      'advert-10': { title: 'I like my unicorn named åäö!' },
      'advert-20': {
        description: ' UniCorns are the best in the whole wåäörld',
      },
    })

    expect(adverts.filter(p).map(({ id }) => id)).toMatchObject([
      'advert-10',
      'advert-20',
    ])
  })
})
