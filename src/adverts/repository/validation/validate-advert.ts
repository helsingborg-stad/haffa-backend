import { StatusCodes } from 'http-status-codes'
import Ajv from 'ajv'
import type {
  AdvertLocation,
  AdvertClaimEvent,
  Advert,
  AdvertClaim,
  AdvertImage,
  AdvertContact,
} from '../../types'
import { toMap } from '../../../lib'
import { normalizeAdvert } from '../../mappers'

const props = <T = Advert>(
  schema: any,
  ...fields: (keyof T)[]
): Record<keyof T, any> =>
  toMap(
    fields,
    field => field as string,
    () => schema
  ) as Record<keyof T, any>

const stringProps = <T = Advert>(
  ...fields: (keyof T)[]
): Record<keyof T, any> => props<T>({ type: 'string' }, ...fields)

const numberProps = <T = Advert>(
  ...fields: (keyof T)[]
): Record<keyof T, any> => props<T>({ type: 'number' }, ...fields)

interface ObjectSchema<T extends object> {
  required?: (keyof T)[]
  additionalProperties?: boolean
  properties: Record<keyof T, any>
}

const describeObject = <T extends object>(schema: ObjectSchema<T>): any => ({
  type: 'object',
  additionalProperties: true, // we allow additional since we narrow input with normalizeXXX(...)
  required: [],
  ...schema,
})

const describeObjectArray = <T extends object>(
  itemSchema: ObjectSchema<T>
): any => ({
  type: 'array',
  items: describeObject<T>(itemSchema),
})

const advertSchemaValidator = new Ajv().compile<Advert>({
  ...describeObject<Advert>({
    required: ['id', 'createdBy', 'createdAt'],
    properties: {
      ...stringProps(
        'id',
        'versionId',
        'type',
        'createdBy',
        'createdAt',
        'modifiedAt',
        'archivedAt',
        'pickedAt'
      ),
      ...stringProps(
        'title',
        'description',
        'unit',
        'width',
        'height',
        'depth',
        'weight',
        'size',
        'material',
        'condition',
        'usage',
        'category',
        'reference',
        'externalId',
        'notes',
        'tags'
      ),
      ...numberProps('quantity', 'lendingPeriod'),
      images: describeObjectArray<AdvertImage>({
        required: ['url'],
        properties: {
          ...stringProps<AdvertImage>('url'),
        },
      }),

      tags: { type: 'array', items: { type: 'string' } },
      location: describeObject<AdvertLocation>({
        properties: {
          ...stringProps<AdvertLocation>(
            'adress',
            'city',
            'country',
            'name',
            'zipCode'
          ),
        },
      }),
      contact: describeObject<AdvertContact>({
        properties: {
          ...stringProps<AdvertContact>('email', 'organization', 'phone'),
        },
      }),
      claims: describeObjectArray<AdvertClaim>({
        required: ['at', 'by', 'type', 'quantity'],
        properties: {
          ...stringProps<AdvertClaim>('at', 'by', 'type'),
          ...numberProps<AdvertClaim>('quantity'),
          events: describeObjectArray<AdvertClaimEvent>({
            required: ['type', 'at'],
            properties: {
              ...props<AdvertClaimEvent>({ type: 'string' }, 'type', 'at'),
            },
          }),
        },
      }),
      waitlist: { type: 'array', items: { type: 'string' } },
    },
  }),
})

export const validateAdvert: (advert: Advert) => Advert = a =>
  advertSchemaValidator(a)
    ? normalizeAdvert(a)
    : (() => {
        // if (process.env.NODE_ENV === 'test') {
        //   console.error(advertSchemaValidator.errors)
        // }
        throw Object.assign(new Error('Validation error'), {
          expose: true,
          status: StatusCodes.BAD_REQUEST,
        })
        return a
      })()
