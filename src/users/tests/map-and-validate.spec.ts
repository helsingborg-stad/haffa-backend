import { makeRoles } from '../../login'
import { loginPolicyAdapter } from '../../login-policies/login-policy-adapter'
import type { HaffaUser } from '../../login/types'
import { createInMemorySettingsService } from '../../settings'
import { createUserMapper } from '../user-mapper'

describe('inMemoryUserMapper::mapAndValidate*', () => {
  const ExpectToMapToNull = [
    null,
    {},
    'not an object',
    { id: 123, hint: 'id is not a string' }, // id should be string,
    { id: 'not an email', hint: 'id not an email' },
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
      roles: makeRoles(true),
    })
  })

  it('mapAndValidateEmail(email) => {id, roles}', async () => {
    const settings = createInMemorySettingsService()
    await loginPolicyAdapter(settings).updateLoginPolicies([
      {
        emailPattern: '.*@user.com',
        roles: ['canEditOwnAdverts'],
      },
    ])
    const mapper = createUserMapper(null, settings)
    const mapped = await mapper.mapAndValidateEmail('test@user.com')
    expect(mapped).toMatchObject({
      id: 'test@user.com',
      roles: { canEditOwnAdverts: true },
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
