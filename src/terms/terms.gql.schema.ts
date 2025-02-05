export const termsGqlSchema = /* GraphQL */ `
  type Query {
    terms: Terms!
  }

  type Mutation {
    updateTerms(input: TermsInput!): Terms
  }

  input TermsInput {
    places: [String]
    organization: [String]
    tags: [String]
    unit: [String]
    material: [String]
    condition: [String]
    usage: [String]
    sizes: [String]
  }

  type Terms {
    places: [String]
    organization: [String]
    tags: [String]
    unit: [String]
    material: [String]
    condition: [String]
    usage: [String]
    sizes: [String]
  }
`
