export const jobsGqlSchema = /* GraphQL */ `
  type Mutation {
    jobRun(taskName: String!): JobDefinition
  }

  type Query {
    jobList: [String]
    jobFind(JobId: String): [JobDefinition]
  }

  type JobDefinition {
    jobId: String!
    owner: String!
    status: String!
    startDate: String!
    endDate: String
    result: TaskExecutionResult
  }

  type TaskExecutionResult {
    param: String
    message: String
  }
`
