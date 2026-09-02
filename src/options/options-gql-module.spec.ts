import type { HaffaUser } from '../login/types'
import type { LoginPolicy } from '../login-policies/types'
import { end2endTest } from '../test-utils'
import { validOptions } from './options-gql-module'

describe('options GQL query only allows specified option names', () => {
  const editorUser: HaffaUser = { id: 'editor@user.com' }

  const grantCanEditTerms = (user: HaffaUser): LoginPolicy[] => [
    {
      emailPattern: user.id,
      roles: ['canEditTerms'],
      deny: false,
    } as LoginPolicy,
  ]

  const OPTIONS_QUERY = /* GraphQL */ `
    query Query($name: String!) {
      options(name: $name) {
        key
        value
      }
    }
  `

  it.each([
    ...validOptions,
  ])('allows fetching the specified option "%s"', name =>
    end2endTest({ user: editorUser }, async ({ gqlRequest, loginPolicies }) => {
      await loginPolicies.updateLoginPolicies(grantCanEditTerms(editorUser))
      const { status, body } = await gqlRequest(OPTIONS_QUERY, { name })
      expect(status).toBe(200)
      expect(body.errors).toBeUndefined()
      expect(body.data.options).toStrictEqual([])
    }))

  it('denies fetching an option name that is not in the allow-list', () =>
    end2endTest({ user: editorUser }, async ({ gqlRequest, loginPolicies }) => {
      await loginPolicies.updateLoginPolicies(grantCanEditTerms(editorUser))
      const { status, body } = await gqlRequest(OPTIONS_QUERY, {
        name: 'some-unspecified-option-name',
      })
      expect(status).toBe(200)
      expect(body.data.options).toBeNull()
      expect(body.errors).toBeDefined()
    }))
})
