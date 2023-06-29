import { advertsGqlSchema } from './adverts.gql.schema'
import { profileSchema } from './profile.gql.schema'
import { termsGqlSchema } from './terms.gql.schema'

export const haffaGqlSchema = advertsGqlSchema + termsGqlSchema + profileSchema
