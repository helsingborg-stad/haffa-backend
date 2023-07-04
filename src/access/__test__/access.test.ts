import { createAccessService } from '../index'

const accessList = [
  {
    pattern: '.*@helsingborg.se',
    roles: ['Administratör', 'Kommun'],
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

const user = createAccessService(accessList)

test('behaviour when user is authorized completely', async () => {
  expect(user.isAuthorized('kalle@helsingborg.se')).toBe(true)
  expect(user.hasRole('kalle@helsingborg.se', 'Administratör')).toBe(true)
})

test('user has role -> Kommun', async () => {
  expect(user.isAuthorized('janne@hotmail.com')).toBe(true)
  expect(user.hasRole('janne@hotmail.com', 'Kommun')).toBe(true)
})

test('behaviour when user is not authorized', async () => {
  expect(user.isAuthorized('janne@helsingborg.com')).toBe(false)
})

test('behaviour when user is authorized but not in the requested role', async () => {
  expect(user.hasRole('janne@helsingborg.se', 'Företag')).toBe(false)
})
