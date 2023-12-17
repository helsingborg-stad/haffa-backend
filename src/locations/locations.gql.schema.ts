export const locationsGqlSchema = /* GraphQL */ `
  type Query {
    locations: [AdvertLocation]
  }

  type Mutation {
    updateLocations(input: [AdvertLocationInput]!): [AdvertLocation]
  }

  type AdvertLocation {
    name: String!
    adress: String!
    zipCode: String!
    city: String!
    country: String
  }

  input AdvertLocationInput {
    name: String!
    adress: String!
    zipCode: String!
    city: String!
    country: String
  }
`
