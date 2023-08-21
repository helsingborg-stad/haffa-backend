import { HaffaUser } from "../../../login/types"
import { createInMemoryUserMapper } from "../in-memory-user-mapper"

describe('inMemoryUserMapper::mapAndValidateUser', ( )=> {
	const ExpectToMapToNull = [
		null,
		{},
		'not an object',
		{ id: 123, roles: [], hint: 'id is not a string' }, // id should be string,
		{ id: 'test@user.com', roles: [ 123, 'admin' ], hint: 'roles is not a string[]' }, // roles should be string[]
		{ id: 'not an email', roles: [], hint: 'id not an email' },
	]

	it.each(ExpectToMapToNull)('mapAndValidateUser(%j) should throw', async (user) => {
		const mapper = createInMemoryUserMapper('')
		expect(await mapper.mapAndValidateUser(user as HaffaUser)).toBeNull()
	})

	it('mapAndValidateUser({id: string, roles: string[]}) => {id, roles}', async () => {
		const mapper = createInMemoryUserMapper('')
		const mapped = await mapper.mapAndValidateUser({
			id: 'test@user.com',
			roles: [ 'x', 'y', 'z' ],
		})
		expect(mapped).toMatchObject({
			id: 'test@user.com',
			roles: [ 'x', 'y', 'z' ],
		})
	})

	it('mapAndValidateUser() strips undocumneted properties', async () => {
		const mapper = createInMemoryUserMapper('')
		const mapped = await mapper.mapAndValidateUser({
			id: 'test@user.com',
			roles: [ 'x', 'y', 'z' ],
			extra1: 1,
			extra2: 'two'
		} as HaffaUser)
		expect(Object.keys(mapped||{}) as any).toMatchObject([ 'id', 'roles' ])
	})

	it('mapAndValidateUser() trims roles', async () => {
		const mapper = createInMemoryUserMapper('')
		const mapped = await mapper.mapAndValidateUser({
			id: 'test@user.com',
			roles: [ 'x', 'y', 'z',null, '', 'p','q','r' ],
		} as HaffaUser)
		expect(mapped).toMatchObject({
			id: 'test@user.com',
			roles: [ 'x', 'y', 'z', 'p', 'q', 'r' ],
		})
	})
})
