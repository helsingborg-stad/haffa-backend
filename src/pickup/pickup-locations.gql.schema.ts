export const pickupLocationsGqlSchema = /* GraphQL */ `
  type Query {
    pickupLocations: [PickupLocation]
    pickupLocationsByAdvert(id: ID!): [PickupLocation]
  }

  type Mutation {
    updatePickupLocations(input: [PickupLocationInput]!): [PickupLocation]
  }

  type PickupLocation {
    name: String!
    adress: String!
    zipCode: String!
    city: String!
    country: String!
    notifyEmail: String!
    trackingName: String!
    tags: [String]!
  }

  input PickupLocationInput {
    name: String!
    adress: String!
    zipCode: String!
    city: String!
    country: String
    notifyEmail: String!
    trackingName: String!
    tags: [String]!
  }
`
