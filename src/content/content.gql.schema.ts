export const contentGqlSchema = /* GraphQL */ `
  type Query {
    viewComposition: ViewComposition
  }
  type Mutation {
    updateComposition(input: ViewCompositionInput!): ViewComposition
  }

  input ViewCompositionInput {
    rows: [ViewRowInput]!
  }

  input ViewRowInput {
    columns: [ViewColumnInput]!
  }

  input ViewColumnInput {
    module: ContentModuleInput!
  }

  input ContentModuleInput {
    title: String
    body: String
    border: String
    image: String
    position: String
    width: String
    imageRef: String
    categories: String
    tags: String
  }

  type ViewComposition {
    rows: [ViewRow]!
  }

  type ViewRow {
    columns: [ViewColumn]!
  }

  type ViewColumn {
    module: ContentModule!
  }

  type ContentModule {
    title: String
    body: String
    border: String
    image: String
    position: String
    width: String
    imageRef: String
    categories: String
    tags: String
  }
`
