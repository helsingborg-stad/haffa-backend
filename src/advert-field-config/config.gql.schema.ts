export const advertFieldConfigGqlSchema = /* GraphQL */ `
  type Query {
    advertFieldConfig: [FieldConfig]
  }

  type Mutation {
    updateFieldConfig(input: [FieldConfigInput!]): [FieldConfig]
  }

  type FieldConfig {
    name: String
    label: String
    visible: Boolean
    mandatory: Boolean
    initial: String
    adornment: String
  }
  input FieldConfigInput {
    name: String
    label: String
    visible: Boolean
    mandatory: Boolean
    initial: String
    adornment: String
  }
`
