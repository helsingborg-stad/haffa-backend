export const categoriesGqlSchema = /* GraphQL */ `
  type Query {
    categories: [Category]
  }

  type Mutation {
    updateCategories(input: [CategoryInput]!): [Category]
  }

  type Category {
    id: String!
    parentId: String!
    label: String!
    co2kg: Int
    valueByUnit: Int
    advertCount: Int!
    unarchivedAdvertCount: Int!
  }

  input CategoryInput {
    id: String!
    parentId: String!
    label: String!
    co2kg: Int
    valueByUnit: Int
  }
`
