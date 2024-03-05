import { validateAdvert } from '.'
import { createEmptyAdvert, createEmptyAdvertContact } from '../../mappers'

describe('validate-advert', () => {
  it('throws on validation error', () => {
    const badAdverts: any[] = [
      null,
      {},
      { id: 'x', title: ['title should be a string'] },
    ]

    badAdverts.forEach(bad =>
      expect(() => validateAdvert(bad)).toThrow('Validation error')
    )
  })

  it('normalizes away unknown properties', () => {
    const ad = createEmptyAdvert({
      title: 'a title',
      description: 'a description',
      contact: createEmptyAdvertContact({
        email: 'test@user.com',
      }),
    })
    const adWithExtra = {
      ...ad,
      extra: [1, 2, 3],
      contact: { ...ad.contact, extra: ['extra', 'stuff'] },
    }

    const n = validateAdvert(adWithExtra) as any

    expect(n).toMatchObject(ad)
    expect(n.extra).toBeUndefined()
    expect(n.contact.extra).toBeUndefined()
  })
})
