export const brandingGqlSchema = /* GraphQL */ `
  type Query {
    brandingOptions: [Option]
  }
  type Mutation {
    updateBrandingOptions(input: [OptionInput]!): [Option]
  }
  type Option {
    name: String!
    value: String!
  }
  input OptionInput {
    name: String!
    value: String!
  }
`
