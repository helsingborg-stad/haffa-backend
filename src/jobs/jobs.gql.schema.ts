export const jobsGqlSchema = /* GraphQL */ `
  type Mutation {
    jobRun(jobName: String!): [Task]
  }

  type Query {
    jobList: [String]
    jobFind(taskId: String): [Task]
  }
  type JobParameters {
    maxReservationDays: Int
    reminderFrequency: Int
  }

  type Task {
    taskId: String!
    jobName: String!
    owner: String!
    status: String!
    startDate: String!
    endDate: String
    parameters: JobParameters
    result: String
  }
`
