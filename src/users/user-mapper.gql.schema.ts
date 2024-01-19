export const userMapperGqlSchema = /* GraphQL */ `
  type Query {
    userMappingConfiguration: UserMappingConfiguration
  }
  type Mutation {
    updateUserMappingConfiguration(
      input: UserMappingConfigurationInput!
    ): UserMappingConfiguration
  }
  type UserMappingConfiguration {
    allowGuestUsers: Boolean!
    phone: UserMappingConfigurationForPhone!
  }
  type UserMappingConfigurationForPhone {
    allowPhoneUsers: Boolean!
    sender: String!
    country: String!
    roles: [String]!
  }

  input UserMappingConfigurationInput {
    allowGuestUsers: Boolean
    phone: UserMappingConfigurationInputForPhone
  }
  input UserMappingConfigurationInputForPhone {
    allowPhoneUsers: Boolean!
    sender: String!
    country: String!
    roles: [String]!
  }
`
