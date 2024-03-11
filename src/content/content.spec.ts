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
              border: 'true',
              image: '',
              width: '100%',
              position: 'top',
              imageRef: '',
              categories: '',
              tags: '',
            },
          },
        ],
      },
    ],
  })
})
