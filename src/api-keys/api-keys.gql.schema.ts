export const apiKeysGqlSchema = /* GraphQL */ `
  type Query {
    apiKeys: [ApiKey]
  }

  type Mutation {
    updateApiKeys(input: [ApiKeyInput]!): [ApiKey]
  }

  type ApiKey {
    secret: String!
    expires: String!
    email: String!
  }

  input ApiKeyInput {
    secret: String!
    expires: String!
    email: String!
  }
`
