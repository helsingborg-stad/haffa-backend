import type { Category } from '../../categories/types'
import { patchCategories } from './patch-categories'

const cat = (c: Partial<Category>): Category => ({
  id: '',
  parentId: '',
  label: '',
  co2kg: 0,
  valueByUnit: 0,
  ...c,
})
describe('patchCategories', () => {
  it('does not update existing', () => {
    const initial = [cat({ id: 'c1', label: 'C1' })]
    const patch = [cat({ id: 'c1', label: 'modified C1' })]

    expect(patchCategories(initial, patch)).toMatchObject(initial)
  })

  it('ignores unlabelled', () => {
    const initial = [cat({ id: 'c1', label: 'C1' })]
    const patch = [cat({ id: 'c1', label: '' }), cat({ id: 'c2' })]

    expect(patchCategories(initial, patch)).toMatchObject(initial)
  })

  it('fixes bad parents', () => {
    const initial = [cat({ id: 'c1', label: 'C1' })]
    const patch = [
      cat({ id: 'c2', label: 'C2', parentId: 'missing' }),
      cat({ id: 'c3', parentId: 'c2', label: 'C3' }),
    ]

    expect(patchCategories(initial, patch)).toMatchObject([
      cat({ id: 'c1', label: 'C1' }),
      cat({ id: 'c2', label: 'C2', parentId: '' }),
      cat({ id: 'c3', parentId: 'c2', label: 'C3' }),
    ])
  })
})
