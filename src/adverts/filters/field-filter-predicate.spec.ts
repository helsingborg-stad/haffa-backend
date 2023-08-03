import { createFieldFilterPredicate } from './field-filter-predicate'

const range = (n: number): number[] => [...Array(n).keys()]

describe('createFieldFilterPredicate', () => {
  const data = range(100).map(i => ({
    id: i,
    title: `title ${i}`,
    description: `description ${i}`,
    idx2: i * 2,
  }))

  const filteredData = (filter: any): any[] =>
    data.filter(createFieldFilterPredicate(filter))

  it.each([
    ['eq 1', { title: { eq: 'title 3' } }, [data[3]]],
    ['eq 2', { id: { eq: 3 } }, [data[3]]],
    ['eq 3', { id: { eq: 3 }, idx2: { eq: 6 } }, [data[3]]],
    ['ne', { title: { ne: 'title 3' } }, data.filter(({ id }) => id !== 3)],
    ['gt', { id: { gt: 50 } }, data.filter(({ id }) => id > 50)],
    ['gte', { id: { gte: 50 } }, data.filter(({ id }) => id >= 50)],
    ['lt', { id: { lt: 50 } }, data.filter(({ id }) => id < 50)],
    ['lte', { id: { lte: 50 } }, data.filter(({ id }) => id <= 50)],
    [
      'contains',
      { description: { contains: 'ion 5' } },
      [data[5], ...data.slice(50, 60)],
    ],
    ['not 1', { not: { id: { lte: 50 } } }, data.filter(({ id }) => id > 50)],
    ['not 2', { not: { title: { eq: 'missing' } } }, data],
    [
      'and 1',
      { and: [{ id: { gt: 50 } }, { idx2: { eq: 98 * 2 } }] },
      data.filter(({ id }) => id === 98),
    ],
    ['and 2', { and: [{ id: { gt: 50 } }, { title: { eq: 'missing' } }] }, []],
    [
      'or 1',
      {
        or: [
          { id: { eq: 10 } },
          { idx2: { eq: 20 * 2 } },
          { title: { eq: 'title 30' } },
          { description: { eq: 'missing' } },
          { randomField: { eq: '?' } },
        ],
      },
      [data[10], data[20], data[30]],
    ],
    ['or 2', { and: [{ id: { gt: 50 } }, { title: { eq: 'missing' } }] }, []],
    [
      'and, or, not',
      { and: [{ not: { id: { gt: 41 } } }, { or: [{ id: { gte: 40 } }] }] },
      [data[40], data[41]],
    ],
  ])('%s', (_title: string, filter: any, expected: any) => {
    expect(filteredData(filter)).toMatchObject(expected)
  })
})
