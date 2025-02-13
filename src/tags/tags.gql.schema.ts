export const tagsGqlSchema = /* GraphQL */ `
  type Query {
    tagDescriptions: [TagDescription]
  }

  type Mutation {
    updateTagDescriptions(input: [TagDescriptionInput]!): [TagDescription]
  }

  type TagDescription {
    tag: String!
    label: String!
    description: String!
  }

  input TagDescriptionInput {
    tag: String!
    label: String!
    description: String!
  }
`
