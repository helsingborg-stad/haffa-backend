export const termsGqlSchema = /* GraphQL */ `
  type Query {
    terms: Terms!
  }

  type Mutation {
    updateTerms(input: TermsInput!): Terms
  }

  input TermsInput {
    organization: [String]
    unit: [String]
    material: [String]
    condition: [String]
    usage: [String]
    tags: [String]
  }

  type Terms {
    organization: [String]
    unit: [String]
    material: [String]
    condition: [String]
    usage: [String]
    tags: [String]
  }
`
