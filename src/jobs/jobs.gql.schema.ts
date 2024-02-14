export const jobsGqlSchema = /* GraphQL */ `
  type Mutation {
    jobRun(jobName: String!): [SyslogData!]
  }
  type SyslogData {
    at: String!
    by: String!
    severity: Int!
    type: String
    message: String
  }
`
