export const syslogGqlSchema = /* GraphQL */ `
  type Query {
    syslog(filter: SyslogFilter): [SyslogData]
  }
  type Mutation {
    pruneSyslog(filter: PruneSyslogFilter): Int
  }

  input SyslogFilter {
    from: String
    to: String
    severity: Int
    type: String
    limit: Int
    skip: Int
  }

  input PruneSyslogFilter {
    from: String
    to: String
    severity: Int
    type: String
  }

  type SyslogData {
    at: String!
    by: String!
    severity: Int!
    type: String
    message: String
  }
`
