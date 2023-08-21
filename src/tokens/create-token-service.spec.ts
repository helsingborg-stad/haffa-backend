import { createTokenService } from '.'
import type { HaffaUser } from '../login/types'
import { createInMemoryUserMapper } from '../users'

const createTokenServiceForTest = (secret: string) => createTokenService(createInMemoryUserMapper(''), secret)

describe('createTokenService', () => {
  const unverifiableTokens = [
    null,
    { id: 'test@user.com', roles: [] },
    [123],
    'abc123',
    createTokenServiceForTest('wrong token').sign({ id: 'test@user.com', roles: [] }),
  ]
  it('TokenService:sign() returns a token', () => {
    const service = createTokenServiceForTest('a secret')
    const token = service.sign({ id: 'test@user.com', roles: [] })
    expect(typeof token).toBe('string')
    expect(token.length > 0).toBeTruthy()
  })
  it('TokenService:verify() embeds user in token', async () => {
    const user: HaffaUser = {
      id: 'test@user.com',
      roles: [],
    }
    const service = createTokenServiceForTest('a secret')
    const token = service.sign(user)
    const verifiedUser = await service.decode(token)
    expect(verifiedUser).toMatchObject(user)
  })

  it.each(unverifiableTokens)('TokenService:verify(%s) => false', async token => {
    expect(await createTokenServiceForTest('a secret').verify(token as string)).toBe(false)
  })

  it.each(unverifiableTokens)('TokenService:decode(%s) => false', async token => {
    expect(await createTokenServiceForTest('a secret').decode(token as string)).toBeNull()
  })
})
