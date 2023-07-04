import { tryCreateHaffaUser } from '../try-create-haffa-user'

describe('tryCreateHaffaUser', ( )=> {
	const ExpectToMapToNull = [
		null,
		{},
		'not an object',
		{ id: 123, roles: [], hint: 'id is not a string' }, // id should be string,
		{ id: 'test@user.com', roles: [ 123, 'admin' ], hint: 'roles is not a string[]' }, // roles should be string[]
		{ id: 'not an email', roles: [], hint: 'id not an email' },
	]

	it.each(ExpectToMapToNull)('tryCreateHaffaUser(%j) should throw', (user) => {
		expect(tryCreateHaffaUser(user)).toBeNull()
	})

	it('tryCreateHaffaUser({id: string, roles: string[]}) => {id, roles}', () => {
		expect(tryCreateHaffaUser({
			id: 'test@user.com',
			roles: [ 'x', 'y', 'z' ],
		})).toMatchObject({
			id: 'test@user.com',
			roles: [ 'x', 'y', 'z' ],
		})
	})

	it('tryCreateHaffaUser() strips undocumneted properties', () => {
		expect(Object.keys(tryCreateHaffaUser({
			id: 'test@user.com',
			roles: [ 'x', 'y', 'z' ],
		}) as any)).toMatchObject([ 'id', 'roles' ])
	})

	it('tryCreateHaffaUser() trims roles', () => {
		expect(tryCreateHaffaUser({
			id: 'test@user.com',
			roles: [ 'x', 'y', 'z',null, '', 'p','q','r' ],
		})).toMatchObject({
			id: 'test@user.com',
			roles: [ 'x', 'y', 'z', 'p', 'q', 'r' ],
		})
	})
})
