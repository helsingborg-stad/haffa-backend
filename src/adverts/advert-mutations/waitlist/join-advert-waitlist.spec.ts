import { makeAdmin } from '../../../login'
import { createGetAdvertMeta } from '../../advert-meta'
import { createEmptyAdvert } from '../../mappers'
import { createInMemoryAdvertsRepository } from '../../repository/memory'
import { createJoinAdvertWaitlist } from './join-advert-waitlist'

describe('joinAdvertWaitlist', () => {
  it('adds unique user', async () => {
    const getAdvertMeta = createGetAdvertMeta()
    const adverts = createInMemoryAdvertsRepository(getAdvertMeta, {
      'advert-1': createEmptyAdvert({ id: 'advert-1', quantity: 0 }),
    })

    const join = createJoinAdvertWaitlist({ adverts, getAdvertMeta })
    await join(makeAdmin({ id: 'me' }), 'advert-1')
    await join(makeAdmin({ id: 'you' }), 'advert-1')
    await join(makeAdmin({ id: 'me' }), 'advert-1')

    expect(adverts.getDb()['advert-1'].waitlist).toMatchObject(['me', 'you'])
  })
})
