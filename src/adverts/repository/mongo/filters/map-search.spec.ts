import { mapSearch } from './map-search'

describe('mapSearch', () => {
  it('ignores empty searches', () => {
    expect(mapSearch()).toBeNull()
    expect(mapSearch('')).toBeNull()
    expect(mapSearch(' \r\n\t ')).toBeNull()
  })
  it('looks in title, description and externalId', () => {
    expect(mapSearch('test')).toMatchObject({
      $or: [
        { 'advert.title': { $regex: 'test', $options: 'i' } },
        { 'advert.description': { $regex: 'test', $options: 'i' } },
        { 'advert.reference': { $regex: 'test', $options: 'i' } },
      ],
    })
  })
})
