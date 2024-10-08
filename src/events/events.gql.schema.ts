export const eventsGqlSchema = /* GraphQL */ `
  type Query {
    events(from: String, to: String): [Event]
    advertEvents(advertId: String): [Event]
  }

  type Event {
    event: String!
    advertId: String
    by: String
    at: String!
    quantity: Int
    organization: String
    byOrganization: String
    category: String
    co2kg: Int
    valueByUnit: Int
  }
`
