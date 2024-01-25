export const smsTemplatesGqlSchema = /* GraphQL */ `
  type Query {
    smsTemplates: [SmsTemplate]
  }

  type Mutation {
    updateSmsTemplates(input: [SmsTemplateInput]!): [SmsTemplate]
  }

  type SmsTemplate {
    templateId: String!
    template: String!
    enabled: Boolean!
  }

  input SmsTemplateInput {
    templateId: String!
    template: String!
    enabled: Boolean!
  }
`
