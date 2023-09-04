export const statsGqlSchema = /* GraphQL */ `
  type Query {
    stats: Stats
  }

  type Stats {
    advertCount: Int
  }
`
