export const subscriptionsGqlSchema = /* GraphQL */ `
  type Query {
    advertSubscriptions: [AdvertSubscription]
  }

  type Mutation {
    addAdvertSubscription(
      filter: AdvertSubscriptionFilterInput!
    ): AdvertSubscription
    removeAdvertSubscription(subscriptionId: String): AdvertSubscription
  }

  type AdvertSubscription {
    subscriptionId: String!
    createdAt: String!
    lastNotifiedAt: String
    filter: AdvertSubscriptionFilter!
  }

  type AdvertSubscriptionFilter {
    search: String
    categories: [String]
    tags: [String]
  }

  input AdvertSubscriptionFilterInput {
    search: String
    categories: [String]
    tags: [String]
  }
`
