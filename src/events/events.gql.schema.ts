export const eventsGqlSchema = /* GraphQL */ `
  type Query {
    events(from: String, to: String): [Event]
    advertEvents(advertId: String): [Event]
    eventSummaries: EventSummaries
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

  type EventSummaries {
    totalCo2: Int
    totalValue: Int
    totalCollects: Int
  }
`
