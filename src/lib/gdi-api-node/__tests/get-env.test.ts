import { getEnv } from '../config'

describe('get-env', () => {
	it('defaults to trimmed process.ENV', () => {
		process.env.TEST_VARIABLE = ' a value '
		expect(getEnv('TEST_VARIABLE')).toEqual('a value')
	})
	it('can have default value specified', () => {
		expect(getEnv('TEST_VARIABLE_THAT_DOES_NOT_EXIST', { fallback: 'a default value' })).toEqual('a default value')
	})

	it('throws on missing key if no fallback is specified', () => {
		expect(() => getEnv('TEST_VARIABLE_THAT_DOES_NOT_EXIST')).toThrow(Error)
	})

	it('throws on validation', () => {
		expect(() => getEnv('PATH', { validate: () => false })).toThrow(Error)
	})

	it('throws when validation throws', () => {
		expect(() => getEnv('PATH', { validate: () => {throw new Error()} })).toThrow(Error)
	})

	it('returns validated values only', () => {
		expect(getEnv('PATH', { fallback: 'a', validate: v => v === 'a' })).toBe('a')
	})

})