import type { MongoConnection } from '../../mongodb-utils/types'
import type { MongoProfile } from './types'
import { createMongoProfileRepository } from './mongo-profile-repository'
import { createEmptyProfile, createEmptyProfileInput } from '../mappers'
import type { HaffaUser } from '../../login/types'
import type { ProfileInput, ProfileRepository } from '../types'
import { createMongoProfileConnection } from './mongio-profile-connection'

const mongoMock = require('mongo-mock')

const mongoTest = async <T extends { id: string }>(
  connection: MongoConnection<T>,
  testfn: (connection: MongoConnection<T>) => Promise<any>
): Promise<any> => {
  try {
    return await testfn(connection)
  } finally {
    await connection.close()
  }
}

const profilesTest = (
  testfn: (
    profiles: ProfileRepository,
    connection: MongoConnection<MongoProfile>
  ) => Promise<any>
): Promise<any> =>
  mongoTest(
    createMongoProfileConnection({
      uri: `mongodb://test/haffa`,
      collectionName: 'profile',
      clientFactory: uri => mongoMock.MongoClient.connect(uri),
    }),
    connection => testfn(createMongoProfileRepository(connection), connection)
  )

const createTestUser = (user?: Partial<HaffaUser>): HaffaUser => ({
  id: 'test@user.com',
  roles: [],
  ...user,
})

const createProfileInput = (input?: Partial<ProfileInput>): ProfileInput => ({
  ...createEmptyProfileInput(),
  ...input,
})

describe('mongo profile respository', () => {
  it('getProfile() returns blank user if missing in db', () =>
    profilesTest(async profiles => {
      const user = createTestUser({ id: 'test@user.com' })
      const profile = await profiles.getProfile(user)

      expect(profile).toMatchObject({
        ...createEmptyProfile(),
        email: user.id,
      })
    }))

  it('updateProfile() upserts profile in db', () =>
    profilesTest(async profiles => {
      const user = createTestUser({ id: 'donald@duck.com' })
      const input = createProfileInput({
        phone: '555-123456',
        city: 'Duck City',
        zipCode: '123456',
        adress: 'Duck Street',
        country: 'Duckland',
      })
      await profiles.updateProfile(user, input)

      const profile = await profiles.getProfile(user)

      expect(profile).toMatchObject({
        email: user.id,
        ...input,
      })
    }))

  it('updateProfile() overwrites profile in db', () =>
    profilesTest(async (profiles, connection) => {
      const user = createTestUser({ id: 'donald@duck.com' })
      const input = createProfileInput({
        phone: '555-123456',
        city: 'Duck City',
        zipCode: '123456',
        adress: 'Duck Street',
        country: 'Duckland',
      })
      // first write
      await profiles.updateProfile(user, createEmptyProfileInput())

      // second write
      await profiles.updateProfile(user, input)
      const profile = await profiles.getProfile(user)

      expect(profile).toMatchObject({
        email: user.id,
        ...input,
      })

      // test that we have exactly one envelope in db
      const items = await (await connection.getCollection()).find({}).toArray()
      expect(items).toMatchObject([
        {
          id: user.id,
          profile,
        },
      ])
    }))
})
