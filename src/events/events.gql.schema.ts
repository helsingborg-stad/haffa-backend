export const eventsGqlSchema = /* GraphQL */ `
  type Query {
    events(from: String, to: String): [Event]
  }

  type Event {
    event: String!
    at: String!
    quantity: Int
    organization: String
    byOrganization: String
    category: String
    co2kg: Int
    valueByUnit: Int
  }
`
