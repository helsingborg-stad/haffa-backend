export const jobsGqlSchema = /* GraphQL */ `
  type Mutation {
    jobRun(jobName: String!): [JobDefinition]
  }

  type Query {
    jobList: [String]
    jobFind(JobId: String): [JobDefinition]
  }
  type JobParameters {
    maxReservationDays: Int
    reminderFrequency: Int
  }

  type JobDefinition {
    jobId: String!
    jobName: String!
    owner: String!
    status: String!
    startDate: String!
    endDate: String
    parameters: JobParameters
    result: TaskExecutionResult
  }

  type TaskExecutionResult {
    action: String
    message: String
  }
`
