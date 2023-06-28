import { tryCreateHaffaUser } from './try-create-haffa-user'

describe('tryCreateHaffaUser', ( )=> {
	const ExpectToMapToNull = [
		null,
		{},
		'not an object',
		{ id: 123, roles: [], hint: 'id is not a string' }, // id should be string,
		{ id: 'a', roles: [123], hint: 'roles is not a string[]' }, // roles should be string[]
	]

	it.each(ExpectToMapToNull)('tryCreateHaffaUser(%j) should throw', (user) => {
		expect(tryCreateHaffaUser(user)).toBeNull()
	})

	it('tryCreateHaffaUser({id: string, roles: string[]}) => {id, roles}', () => {
		expect(tryCreateHaffaUser({
			id: 'a',
			roles: [ 'x', 'y', 'z' ],
		})).toMatchObject({
			id: 'a',
			roles: [ 'x', 'y', 'z' ],
		})
	})
})
