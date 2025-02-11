import { mapWorkflow } from './map-workflow'

describe('mapWorkflow', () => {
  it('ignores empty searches', () => {
    expect(mapWorkflow()).toBeNull()
    expect(mapWorkflow({})).toBeNull()
    expect(mapWorkflow({ pickupLocationTrackingNames: [] })).toBeNull()
    expect(mapWorkflow({ pickupLocationTrackingNames: [''] })).toBeNull()
    expect(mapWorkflow({ places: [] })).toBeNull()
    expect(mapWorkflow({ places: [''] })).toBeNull()
  })

  it('handles pickup locations', () => {
    expect(
      mapWorkflow({ pickupLocationTrackingNames: ['a', 'b', '', 'cc'] })
    ).toMatchObject({
      'workflow.pickupLocationTrackingNames': {
        $elemMatch: { $in: ['a', 'b', 'cc'] },
      },
    })
  })

  it('handles places', () => {
    expect(mapWorkflow({ places: ['a', 'b', '', 'cc'] })).toMatchObject({
      'advert.place': {
        $in: ['a', 'b', 'cc'],
      },
    })
  })

  it('handles combinations with AND', () => {
    expect(
      mapWorkflow({
        pickupLocationTrackingNames: ['a', 'b', 'c'],
        places: ['place1', '', 'place2'],
      })
    ).toMatchObject({
      $and: [
        {
          'workflow.pickupLocationTrackingNames': {
            $elemMatch: { $in: ['a', 'b', 'c'] },
          },
        },
        {
          'advert.place': {
            $in: ['place1', 'place2'],
          },
        },
      ],
    })
  })
})
