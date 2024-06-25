import { getTokenFromAuthorizationHeader } from '../get-token-from-authorization-header'

describe('getTokenFromAuthorizationHeader', () => {
	it('understands Authorization: Bearer <token>', () => {
		expect(getTokenFromAuthorizationHeader({
			authorization: 'Bearer test-token',
		}))
			.toBe('test-token')
	})
	it('understands Authorization: bearer <token>', () => {
		expect(getTokenFromAuthorizationHeader({
			authorization: 'bearer test-token',
		}))
			.toBe('test-token')
	})
	it('will trim() the token', () => {
		expect(getTokenFromAuthorizationHeader({
			authorization: 'bearer     test-token        ',
		}))
			.toBe('test-token')
	})
	it('return null on missing Authorization header', () => {
		expect(getTokenFromAuthorizationHeader({
		}))
			.toBeNull()
	})
	it('return null on malformed Authorization header', () => {
		expect(getTokenFromAuthorizationHeader({
			authorization: 'beaver eager',
		}))
			.toBeNull()
	})
})