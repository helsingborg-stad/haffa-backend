export const loginPoliciesGqlSchema = /* GraphQL */ `
  type Query {
    loginPolicies: [LoginPolicy]
  }

  type Mutation {
    updateLoginPolicies(input: [LoginPolicyInput]!): [LoginPolicy]
  }

  type LoginPolicy {
    emailPattern: String
    roles: [String]
    deny: Boolean
  }

  input LoginPolicyInput {
    emailPattern: String
    roles: [String]
    deny: Boolean
  }
`
