export const advertFieldConfigGqlSchema = /* GraphQL */ `
  type Query {
    advertFieldConfig: [FieldConfig]
  }

  type Mutation {
    updateFieldConfig(input: [FieldConfigInput!]): [FieldConfig]
  }

  type FieldConfig {
    name: String
    visible: Boolean
    mandatory: Boolean
  }
  input FieldConfigInput {
    name: String
    visible: Boolean
    mandatory: Boolean
  }
`
