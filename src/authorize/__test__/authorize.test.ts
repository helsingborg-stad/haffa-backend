import { User } from '../authorize'

const list = [ {
	pattern: '.*@helsingborg.se',
	roles: [ 'Administratör', 'Kommun' ],
},
{
	pattern: 'kalle@.*',
	roles: ['Företag'],
},
{
	pattern: '.*@hotmail.com',
	roles: ['Kommun'],
},
]
  
test('behaviour when user is authorized completely', async () => {
	const user = User('kalle@helsingborg.se', list)
	expect(user.isAuthorized).toEqual(true)
	expect(user.hasRole('Administratör')).toEqual(true)
})
test('behaviour when user is authorized completely', async () => {
	const user = User('janne@hotmail.com', list)
	expect(user.isAuthorized).toEqual(true)
	expect(user.hasRole('Kommun')).toEqual(true)
})
test('behaviour when user is not authorized', async () => {
	const user = User('janne@helsingborg.com', list)
	expect(user.isAuthorized).toEqual(false)
})
test('behaviour when user is authorized but not in the requested role', async () => {
	const user = User('janne@helsingborg.se', list)
	expect(user.hasRole('Företag')).toEqual(false)
})
