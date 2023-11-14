import type { Filter } from 'mongodb'
import type { AdvertFieldsFilterInput } from '../../../types'
import type { MongoAdvert } from '../types'
import { combineAnd, escapeRegExp } from './filter-utils'

const makeMongoOperatorExpression = (
  fieldName: string,
  operator: string,
  operand: string | string[]
): Filter<MongoAdvert> => ({
  [`advert.${fieldName}`]: { [operator]: operand },
})

const fieldFilter2MongoFilter: Record<
  string,
  (fieldName: string, operand: string | string[]) => Filter<MongoAdvert> | null
> = {
  eq: (fieldName, operand) =>
    makeMongoOperatorExpression(fieldName, '$eq', operand),
  ne: (fieldName, operand) =>
    makeMongoOperatorExpression(fieldName, '$ne', operand),
  gt: (fieldName, operand) =>
    makeMongoOperatorExpression(fieldName, '$gt', operand),
  gte: (fieldName, operand) =>
    makeMongoOperatorExpression(fieldName, '$gte', operand),
  lt: (fieldName, operand) =>
    makeMongoOperatorExpression(fieldName, '$lt', operand),
  lte: (fieldName, operand) =>
    makeMongoOperatorExpression(fieldName, '$lte', operand),
  in: (fieldName, operand) =>
    makeMongoOperatorExpression(fieldName, '$in', operand),
  contains: (fieldName, operand) =>
    makeMongoOperatorExpression(
      fieldName,
      '$regex',
      escapeRegExp((operand as string) || '')
    ),
}

export const mapFields = (
  fields?: AdvertFieldsFilterInput
): Filter<MongoAdvert> | null =>
  combineAnd(
    ...Object.entries(fields || {})
      // detect mentioned fields
      .map(([field, filter]) => ({ field, filter }))
      // per field, mentioned operators
      .map(({ field, filter }) =>
        Object.entries(filter).map(([operator, operand]) => ({
          field,
          operator,
          operand,
        }))
      )
      .reduce((m, l) => m.concat(l), [])
      // map to Mongo filter
      .map(
        ({ field, operator, operand }) =>
          fieldFilter2MongoFilter[operator]?.(field, operand) || null
      )
      .filter(v => v)
  )
