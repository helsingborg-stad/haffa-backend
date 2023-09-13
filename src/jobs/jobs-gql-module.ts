import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { jobsGqlSchema } from './jobs.gql.schema'
import { expireReservations } from './expire-reservations'
import { isAdmin } from '../login'

export const createJobsGqlModule = ({
  jobs,
  adverts,
  profiles,
  files,
  notifications,
}: Pick<
  Services,
  'adverts' | 'jobs' | 'profiles' | 'files' | 'notifications'
>): GraphQLModule => ({
  schema: jobsGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      jobList: async () => jobs.list(),
      jobFind: async ({ args: { JobId } }) => jobs.find(JobId),
    },
    Mutation: {
      jobRun: async ({ ctx, args: { taskName } }) => {
        const { user } = ctx
        if (!isAdmin(user)) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return jobs.runAs(user, taskName, {
          adverts,
          profiles,
          files,
          notifications,
        })
      },
    },
  },
})
