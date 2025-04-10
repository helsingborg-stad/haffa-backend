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
    size: String
    body: String
    align: String
    border: String
    background: String
    color: String
    image: String
    alt: String
    position: String
    width: String
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
    size: String
    body: String
    align: String
    border: String
    background: String
    image: String
    color: String
    alt: String
    position: String
    width: String
    categories: String
    tags: String
  }
`
