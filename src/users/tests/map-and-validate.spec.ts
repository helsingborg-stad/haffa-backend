import type { HaffaUser } from '../../login/types'
import { createInMemorySettingsService } from '../../settings'
import { createUserMapper } from '../user-mapper'

describe('inMemoryUserMapper::mapAndValidate*', () => {
  const ExpectToMapToNull = [
    null,
    {},
    'not an object',
    { id: 123, roles: [], hint: 'id is not a string' }, // id should be string,
    {
      id: 'test@user.com',
      roles: [123, 'admin'],
      hint: 'roles is not a string[]',
    }, // roles should be string[]
    { id: 'not an email', roles: [], hint: 'id not an email' },
  ]

  it.each(ExpectToMapToNull)(
    'mapAndValidateUser(%j) should give null',
    async user => {
      const mapper = createUserMapper(null, createInMemorySettingsService())
      expect(await mapper.mapAndValidateUser(user as HaffaUser)).toBeNull()
    }
  )

  it('mapAndValidateEmail(superUser) => {id, roles: <admin roles>}', async () => {
    const mapper = createUserMapper(
      'super@user.com',
      createInMemorySettingsService()
    )
    const mapped = await mapper.mapAndValidateEmail('super@user.com')
    expect(mapped).toMatchObject({
      id: 'super@user.com',
      roles: ['admin'],
    })
  })

  it('mapAndValidateEmail(email) => {id, roles}', async () => {
    const mapper = createUserMapper(
      null,
      createInMemorySettingsService({
        'login-policies': [
          {
            emailPattern: '.*@user.com',
            roles: ['a', 'b'],
            deny: false,
          },
        ],
      })
    )
    const mapped = await mapper.mapAndValidateEmail('test@user.com')
    expect(mapped).toMatchObject({
      id: 'test@user.com',
      roles: ['a', 'b'],
    })
  })

  it('mapAndValidateEmail(email) => null if email is denied', async () => {
    const mapper = createUserMapper(
      null,
      createInMemorySettingsService({
        'login-policies': [
          {
            emailPattern: '.*@user.com',
            roles: ['a', 'b'],
            deny: true,
          },
          {
            emailPattern: '.*',
            roles: ['a', 'b'],
            deny: false,
          },
        ],
      })
    )
    const mapped = await mapper.mapAndValidateEmail('test@user.com')
    expect(mapped).toBeNull()
  })

  it('mapAndValidateEmail(email) => null if domain is not matched', async () => {
    const mapper = createUserMapper(
      null,
      createInMemorySettingsService({
        'login-policies': [
          {
            emailPattern: '.*@others.com',
            roles: ['a', 'b'],
            deny: true,
          },
        ],
      })
    )
    const mapped = await mapper.mapAndValidateEmail('test@user.com')
    expect(mapped).toBeNull()
  })
})
