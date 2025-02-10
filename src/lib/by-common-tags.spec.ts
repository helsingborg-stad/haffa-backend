import { byCommonTags } from './by-common-tags'

describe('by-common-tags', () => {
  it('handles zero-length input', () => {
    expect(byCommonTags(['a', 'b', 'c'], c => [c])([])).toMatchObject([])
  })

  it('handles zero-length source', () => {
    expect(byCommonTags([], c => [c])(['a', 'b', 'c'])).toMatchObject([])
  })

  it('handles zero overlap', () => {
    expect(
      byCommonTags(['a', 'b', 'c'], c => [c])(['x', 'y', 'z'])
    ).toMatchObject([])
  })

  it('returns unique in order', () => {
    expect(
      byCommonTags(['a', 'b', 'c'], c => [c])(['a', 'x', 'b', 'a', 'b'])
    ).toMatchObject(['a', 'b'])
  })
})
