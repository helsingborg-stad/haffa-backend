import { createTokenService } from '.'
import { HaffaUser } from '../login/types'

describe('createTokenService', () => {

	const unverifiableTokens = [
		null,
		{ id: 'test@user.com', roles: [] },
		[123],
		'abc123',
		createTokenService('wrong token').sign({ id: 'test@user.com', roles: [] }),
	]
	it('TokenService:sign() returns a token', () => {
		const service = createTokenService('a secret')
		const token = service.sign({ id: 'test@user.com', roles: [] })
		expect(typeof token).toBe('string')
		expect(token.length > 0).toBeTruthy()
	})
	it('TokenService:verify() embeds user in token', () => {
		const user: HaffaUser = {
			id: 'test@user.com',
			roles: [],
		}
		const service = createTokenService('a secret')
		const token = service.sign(user)
		const verifiedUser = service.decode(token)
		expect(verifiedUser).toMatchObject(user)
	})

	it.each(unverifiableTokens)('TokenService:verify(%s) => false', token => {
		expect(createTokenService('a secret').verify(token as string)).toBe(false)
	})

	it.each(unverifiableTokens)('TokenService:decode(%s) => false', token => {
		expect(createTokenService('a secret').decode(token as string)).toBe(null)
	})
})