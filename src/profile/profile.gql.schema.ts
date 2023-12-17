export const profileGqlSchema = /* GraphQL */ `
  type Query {
    profile: Profile!
  }

  type Mutation {
    updateProfile(input: ProfileInput!): Profile!
    removeProfile(input: RemoveProfileInput!): OperationResult!
  }

  type Profile {
    email: String!
    name: String
    phone: String
    adress: String
    zipCode: String
    city: String
    country: String
    organization: String
  }

  input ProfileInput {
    name: String
    phone: String
    adress: String
    zipCode: String
    city: String
    country: String
    organization: String
  }

  input RemoveProfileInput {
    removeAdverts: Boolean
  }
`
