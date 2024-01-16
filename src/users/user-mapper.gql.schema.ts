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
  }
  input UserMappingConfigurationInput {
    allowGuestUsers: Boolean!
  }
`
