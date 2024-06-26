import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { loginPoliciesGqlSchema } from './login-policies.gql.schema'
import { loginPolicyAdapter } from './login-policy-adapter'
import { normalizeRoles } from '../login'
import type { GraphQLModule } from '../lib/gdi-api-node'

export const createLoginPoliciesGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: loginPoliciesGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      loginPolicies: async ({ ctx }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditSystemLoginPolicies) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return loginPolicyAdapter(settings).getLoginPolicies()
      },
    },
    Mutation: {
      updateLoginPolicies: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditSystemLoginPolicies) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return loginPolicyAdapter(settings).updateLoginPolicies(input)
      },
    },
  },
})
