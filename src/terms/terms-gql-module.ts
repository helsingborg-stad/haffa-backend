import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { termsGqlSchema } from './terms.gql.schema'

export const createTermsGqlModule = (): GraphQLModule => ({
  schema: termsGqlSchema,
  resolvers: {
    Query: {
      terms: () => ({
        unit: [
          'st',
          'm',
          'dm',
          'cm',
          'mm',
          'm²',
          'dm²',
          'cm²',
          'mm²',
          'm³',
          'dm³',
          'cm³',
          'mm³',
          'l',
          'kg',
          'hg',
          'g',
          'mg',
        ],
        material: ['Trä', 'Plast', 'Metall', 'Textil', 'Annat'],
        condition: ['Nyskick', 'Bra', 'Sliten'],
        usage: ['Inomhus', 'Utomhus'],
      }),
    },
  },
})
