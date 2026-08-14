import { normalizeComposition } from './mappers'
import type { ViewComposition } from './types'

it('should normalize invalid composition', () => {
  expect(
    normalizeComposition({} as ViewComposition)
  ).toMatchObject<ViewComposition>({
    rows: [],
  })
  expect(
    normalizeComposition({
      rows: [
        {
          columns: [
            {
              module: {
                title: '',
              },
            },
          ],
        },
      ],
    } as ViewComposition)
  ).toMatchObject<ViewComposition>({
    rows: [
      {
        columns: [
          {
            module: {
              title: '',
              size: 'h6',
              body: '',
              align: 'left',
              border: 'true',
              background: '',
              darkBackground: '',
              color: '',
              darkColor: '',
              image: '',
              alt: '',
              width: '100%',
              position: 'top',
              categories: '',
              tags: '',
            },
          },
        ],
      },
    ],
  })
})

it('should coalesce explicit nulls from GraphQL input back to defaults', () => {
  expect(
    normalizeComposition({
      rows: [
        {
          columns: [
            {
              module: {
                title: 'Title',
                darkBackground: null,
                darkColor: null,
                background: null,
              },
            },
          ],
        },
      ],
    } as unknown as ViewComposition)
  ).toMatchObject<ViewComposition>({
    rows: [
      {
        columns: [
          {
            module: {
              title: 'Title',
              size: 'h6',
              body: '',
              align: 'left',
              border: 'true',
              background: '',
              darkBackground: '',
              color: '',
              darkColor: '',
              image: '',
              alt: '',
              width: '100%',
              position: 'top',
              categories: '',
              tags: '',
            },
          },
        ],
      },
    ],
  })
})
