export const loginPoliciesGqlSchema = /* GraphQL */ `
  type Query {
    loginPolicies: [LoginPolicy]
  }

  type Mutation {
    updateLoginPolicies(input: [LoginPolicyInput]!): [LoginPolicy]
  }

  type LoginPolicyRoles {
    canEditOwnAdverts: Boolean
    canArchiveOwnAdverts: Boolean
    canRemoveOwnAdverts: Boolean
    canReserveAdverts: Boolean
    canCollectAdverts: Boolean
    canManageOwnAdvertsHistory: Boolean
    canManageAllAdverts: Boolean
    canEditSystemCategories: Boolean
    canEditSystemLoginPolicies: Boolean
    canRunSystemJobs: Boolean
  }

  input LoginPolicyRolesInput {
    canEditOwnAdverts: Boolean
    canArchiveOwnAdverts: Boolean
    canRemoveOwnAdverts: Boolean
    canReserveAdverts: Boolean
    canCollectAdverts: Boolean
    canManageOwnAdvertsHistory: Boolean
    canManageAllAdverts: Boolean
    canEditSystemCategories: Boolean
    canEditSystemLoginPolicies: Boolean
    canRunSystemJobs: Boolean
  }

  type LoginPolicy {
    emailPattern: String
    roles: LoginPolicyRoles
    deny: Boolean
  }

  input LoginPolicyInput {
    emailPattern: String
    roles: LoginPolicyRolesInput
    deny: Boolean
  }
`
