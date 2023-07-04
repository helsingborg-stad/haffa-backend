export const profileGqlSchema = /* GraphQL */ `
  type Query {
    profile: Profile!
  }

  type Mutation {
    updateProfile(input: ProfileInput!): Profile!
  }

  type Profile {
    email: String!
    phone: String
    adress: String
    zipCode: String
    city: String
    country: String
  }

  input ProfileInput {
    phone: String
    adress: String
    zipCode: String
    city: String
    country: String
  }
`
