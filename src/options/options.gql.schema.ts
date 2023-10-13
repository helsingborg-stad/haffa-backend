export const optionsGqlSchema = /* GraphQL */ `
  type Query {
    options(name: String!): [Option]
  }
  type Mutation {
    updateOptions(name: String!, input: [OptionInput]!): [Option]
  }
  type Option {
    key: String!
    value: String!
  }
  input OptionInput {
    key: String!
    value: String!
  }
`
