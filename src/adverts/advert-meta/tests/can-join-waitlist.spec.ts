import { getAdvertMeta } from '..'
import { makeAdmin, makeUser } from '../../../login'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'
import type { Advert, AdvertClaim } from '../../types'
import { AdvertClaimType, AdvertType } from '../../types'

const makeClaim = (c?: Partial<AdvertClaim>): AdvertClaim => ({
  quantity: 1,
  by: '',
  at: '',
  type: AdvertClaimType.collected,
  events: [],
  ...c,
})
const reserved = (c?: Partial<AdvertClaim>) =>
  makeClaim({ type: AdvertClaimType.reserved, ...c })
const collected = (c?: Partial<AdvertClaim>) =>
  makeClaim({ type: AdvertClaimType.collected, ...c })

describe('getAdvertMeta::canJoinWatlist', () => {
  const joinableUser = makeAdmin({ id: 'test@user' })
  const deniedUser = makeUser({
    id: 'someone@else',
    roles: { canJoinWaitlist: false },
  })

  const advertsInStock = [
    createEmptyAdvert({ quantity: 1 }),
    createEmptyAdvert({ quantity: 2, claims: [reserved()] }),
    createEmptyAdvert({ quantity: 3, claims: [collected()] }),
    createEmptyAdvert({ quantity: 10, claims: [reserved(), collected()] }),
  ]

  const advertsOutOfStock = [
    createEmptyAdvert({ quantity: 0 }),
    createEmptyAdvert({ quantity: 2, claims: [reserved({ quantity: 2 })] }),
    createEmptyAdvert({
      quantity: 3,
      claims: [collected({ quantity: 2 }), reserved()],
    }),
    createEmptyAdvert({
      quantity: 10,
      claims: [reserved({ quantity: 5 }), collected({ quantity: 5 })],
    }),
  ]

  const isJoinWaitListForEvery = (
    adverts: Advert[],
    users: HaffaUser[],
    expected: boolean
  ) =>
    users.every(u =>
      adverts.every(a => getAdvertMeta(a, u).canJoinWaitList === expected)
    )

  it('joinWaitList -> false when roles::canJoinWaitList -> false', () =>
    expect(
      isJoinWaitListForEvery(
        [...advertsInStock, ...advertsOutOfStock],
        [deniedUser],
        false
      )
    ).toBe(true))

  it('joinWaitList -> false when in stock', () =>
    expect(
      isJoinWaitListForEvery(
        [...advertsInStock],
        [joinableUser, deniedUser],
        false
      )
    ).toBe(true))

  it('joinWaitlist -> true when out of stock and allowed by roles', () =>
    expect(
      isJoinWaitListForEvery(advertsOutOfStock, [joinableUser], true)
    ).toBe(true))

  it('joinWaitlist -> false when in stock and allowed by roles', () =>
    expect(isJoinWaitListForEvery(advertsInStock, [joinableUser], false)).toBe(
      true
    ))

  it('joinWaitList -> false when already on waitlist', () =>
    expect(
      isJoinWaitListForEvery(
        advertsOutOfStock.map(a => ({ ...a, waitlist: [joinableUser.id] })),
        [joinableUser],
        false
      )
    ).toBe(true))
})
