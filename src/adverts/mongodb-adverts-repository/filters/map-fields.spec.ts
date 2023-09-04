import { mapFields } from './map-fields'

describe('mapFieldsFilter', () => {
  const operators = [
    ['eq', '$eq'],
    ['ne', '$ne'],
    ['gt', '$gt'],
    ['lt', '$lt'],
    ['gte', '$gte'],
    ['lte', '$lte'],
    ['in', '$in'],
    ['contains', '$regex'],
  ].map(([ourOperator, mongoOperator]) => [
    { id: { [ourOperator]: 'a' } },
    { 'advert.id': { [mongoOperator]: 'a' } },
  ])

  it.each(operators)('mapFieldsFilter(%j) => %j', (ourFilter, expectedFilter) =>
    expect(mapFields(ourFilter)).toMatchObject(expectedFilter)
  )

  it('can map multiple fields', () => {
    expect(
      mapFields({
        id: {
          eq: 'a',
        },
        category: { eq: 'c' },
      })
    ).toMatchObject({
      $and: [
        { 'advert.id': { $eq: 'a' } },
        { 'advert.category': { $eq: 'c' } },
      ],
    })
  })
})
