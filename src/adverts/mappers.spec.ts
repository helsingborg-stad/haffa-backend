import { mapCreateAdvertInputToAdvert } from './mappers'

describe('mapCreateAdvertInputToAdvert', () => {
  it('should set input field, user and timestamps', () => {
    const advert = mapCreateAdvertInputToAdvert(
      {
        title: 'the title',
        description: 'the description',
        unit: 'u',
        material: 'm',
        condition: 'c',
        usage: 'us',
        images: [],
        quantity: 0,
      },
      {
        id: 'the@user',
        roles: [],
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
