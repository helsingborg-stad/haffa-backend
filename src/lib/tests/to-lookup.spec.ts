import { toLookup } from '..'

describe('toLookup', () => {
  it('groups objects by key', () => {
    expect(
      toLookup(['bear', 'ostrich', 'barnacle', 'elephant', 'orca', 'ox'], s =>
        s.charAt(0)
      )
    ).toMatchObject({
      b: ['bear', 'barnacle'],
      o: ['ostrich', 'orca', 'ox'],
      e: ['elephant'],
    })
  })
})
