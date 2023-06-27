import { mapContextUserToUser, mapCreateAdvertInputToAdvert } from './mappers'

describe('mapContextUserToUser', ( )=> {
	const ExpectToThrow = [
		null,
		{},
		'not an object',
		{ id: 123, roles: [], hint: 'id is not a string' }, // id should be string,
		{ id: 'a', roles: [123], hint: 'roles is not a string[]' }, // roles should be string[]
	]

	it.each(ExpectToThrow)('mapContextUserToUser(%j) should throw', (user) => {
		expect(() => mapContextUserToUser(user)).toThrow()
	})

	it('mapContextUserToUser({id: string, roles: string[]}) => {id, roles}', () => {
		expect(mapContextUserToUser({
			id: 'a',
			roles: [ 'x', 'y', 'z' ],
		})).toMatchObject({
			id: 'a',
			roles: [ 'x', 'y', 'z' ],
		})
	})
})

describe('mapCreateAdvertInputToAdvert', () => {
	it('should set input field, user and timestamps', () => {
		const advert = mapCreateAdvertInputToAdvert({
			title: 'the title',
			description: 'the description',
			unit: 'u',
			material: 'm',
			condition: 'c',
			usage: 'us',
		}, {
			id: 'the@user',
			roles: [],
		}, '2023-06-26')
		expect(advert).toMatchObject({
			title: 'the title',
			description: 'the description',
			createdBy: 'the@user',
			createdAt: '2023-06-26',
			unit: 'u',
			material: 'm',
			condition: 'c',
			usage: 'us',
		})

		expect(advert.id.length).toBeGreaterThan(32)
	})
})