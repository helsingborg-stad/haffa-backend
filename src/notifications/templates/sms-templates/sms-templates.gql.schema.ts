export const smsTemplatesGqlSchema = /* GraphQL */ `
  type Query {
    smsTemplates: [SmsTemplate]
  }

  type Mutation {
    previewSmsTemplates(
      input: [SmsTemplateInput]!
      jsonEncodedData: String!
    ): [SmsTemplatePreview]
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

  type SmsTemplatePreview {
    templateId: String!
    template: String!
    preview: String!
  }
`
