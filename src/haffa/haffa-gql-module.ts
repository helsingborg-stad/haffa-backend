import type { Services } from '../types'
import { createAdvertsGqlModule } from '../adverts/adverts-gql-module'
import { createProfileGqlModule } from '../profile/profile-gql-module'
import { createTermsGqlModule } from '../terms/terms-gql-module'
import { createLoginPoliciesGqlModule } from '../login-policies'
import { createCategoriesGqlModule } from '../categories'
import { createStatsGqlModule } from '../stats'
import { createJobsGqlModule } from '../jobs/jobs-gql-module'
import { createApiKeysGqlModule } from '../api-keys/api-keys-gql-module'
import { createOptionsGqlModule } from '../options/options-gql-module'
import { createEventsGqlModule } from '../events/events-gql-module'
import { createSubscriptionsGqlModule } from '../subscriptions/subscriptions-gql-module'
import { haffaGqlSchema } from './haffa.gql.schema'
import { createContentGqlModule } from '../content/content-gql-module'
import { createAdvertFieldConfigGqlModule } from '../advert-field-config'
import { createLocationsGqlModule } from '../locations/locations-gql-module'
import { createUserMapperGqlModule } from '../users'
import { createSmsTemplatesGqlModule } from '../notifications/templates/sms-templates/sms-templates-gql-module'
import { createSyslogGqlModule } from '../syslog/syslog-gql-module'
import type { GraphQLModule } from '../lib/gdi-api-node'
import type { EntityResolverMap } from '../lib/gdi-api-node/graphql'
import { createPickupLocationsGqlModule } from '../pickup/pickup-locations-gql-module'

export const createStandardGqlModule = (): GraphQLModule => ({
  schema: haffaGqlSchema,
  resolvers: {},
})

export const createHaffaGqlModule = (services: Services): GraphQLModule =>
  mergeModules(
    createStandardGqlModule(),
    createAdvertsGqlModule(services),
    createProfileGqlModule(services),
    createTermsGqlModule(services),
    createCategoriesGqlModule(services),
    createLoginPoliciesGqlModule(services),
    createApiKeysGqlModule(services),
    createStatsGqlModule(services),
    createJobsGqlModule(services),
    createOptionsGqlModule(services),
    createEventsGqlModule(services),
    createSubscriptionsGqlModule(services),
    createContentGqlModule(services),
    createAdvertFieldConfigGqlModule(services),
    createLocationsGqlModule(services),
    createPickupLocationsGqlModule(services),
    createUserMapperGqlModule(services),
    createSmsTemplatesGqlModule(services),
    createSyslogGqlModule(services)
  )

const mergeModules = (...modules: GraphQLModule[]): GraphQLModule => ({
  schema: modules.map(({ schema }) => schema).join(''),
  resolvers: mergeResolvers(modules.map(({ resolvers }) => resolvers)),
})
const mergeResolvers = (resolvers: EntityResolverMap[]): EntityResolverMap => {
  const result: EntityResolverMap = {}
  resolvers.forEach(resolver => {
    Object.entries(resolver).forEach(([type, typeResolver]) => {
      result[type] = {
        ...result[type],
        ...typeResolver,
      }
    })
  })
  return result
}
