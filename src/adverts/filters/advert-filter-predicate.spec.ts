import {createAdvertFilterPredicate} from './advert-filter-predicate'
import {createEmptyAdvert} from './../mappers'
import { Advert } from '../types'
import { HaffaUser } from '../../login/types'
describe('createAdvertFilterPredicate', () => {

  const createTestUser = (user?: Partial<HaffaUser>): HaffaUser => ({
    id: 'test@testerson.com',
    roles: []
  })

  const createSampleAdverts = (
    count: number, 
    patches?: Record<string, Partial<Advert>>
    ): Advert[] => [...Array(count)].map(createEmptyAdvert)
    .map((advert, index) => ({...advert, id: `advert-${index}`}))
    .map(advert => ({
      ...advert,
      ...patches?.[advert.id]
    }))

  it('matches all by default', () => {
    const adverts = createSampleAdverts(10);
    expect(adverts.filter(createAdvertFilterPredicate(createTestUser())))
      .toMatchObject(adverts)
  })

  it('does free text search in {title, description}', () => {
    const p = createAdvertFilterPredicate(createTestUser(), {search: 'unicorn'})

    const adverts = createSampleAdverts(100, {
      'advert-10': {title: 'I like my unicorn!'},
      'advert-20': {description: ' UniCorns are the best'}
    });
    
    expect(
      adverts.filter(p)
      .map(({id}) => id))
      .toMatchObject(['advert-10', 'advert-20'])
  })

  it('treats search text as a list of separate words combined with or to match {title, description}', () => {
    const p = createAdvertFilterPredicate(createTestUser(), {search: 'unicorn orange banana'})

    const adverts = createSampleAdverts(100, {
      'advert-10': {title: 'I like my unicorn!'},
      'advert-20': {description: 'Oranges are the best'},
      'advert-30': {description: 'my oranges brings unicorns to my yard'},
      'advert-40': {description: 'the amazing banana bender'}})
    
    expect(
      adverts.filter(p)
      .map(({id}) => id))
      .toMatchObject(['advert-10', 'advert-20', 'advert-30', 'advert-40'])
  })

  it('combines search text with filter predicates with logical AND', () => {
    const p = createAdvertFilterPredicate(createTestUser(), {search: 'unicorn', fields: {
      description: {
        'contains': 'orange'
      }
    }})

    const adverts = createSampleAdverts(100, {
      'advert-10': {title: 'I like my unicorn!'},
      'advert-20': {description: 'Unicorns are the best'},
      'advert-30': {title: 'I have an unicorn', description: 'I loves oranges'}})
    
    expect(
      adverts.filter(p)
      .map(({id}) => id))
      .toMatchObject(['advert-30'])
  })
})