import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { jobsGqlSchema } from './jobs.gql.schema'
import { normalizeRoles } from '../login'

export const createJobsGqlModule = (services: Services): GraphQLModule => ({
  schema: jobsGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      jobList: async ({ ctx }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canRunSystemJobs) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return services.jobs.list()
      },
      jobFind: async ({ ctx, args: { taskId } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canRunSystemJobs) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return services.jobs.find(taskId)
      },
    },
    Mutation: {
      jobRun: async ({ ctx, args: { jobName } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canRunSystemJobs) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return services.jobs.runAs(user, jobName, services)
      },
    },
  },
})
