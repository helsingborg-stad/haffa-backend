export const advertsGqlSchema = /* GraphQL */ `
  type Query {
    adverts(filter: AdvertFilterInput): AdvertList
    getAdvert(id: ID!): Advert
  }

  type Mutation {
    createAdvert(input: AdvertInput!): AdvertMutationResult
    updateAdvert(id: ID!, input: AdvertInput!): AdvertMutationResult
    removeAdvert(id: ID!): AdvertMutationResult
    reserveAdvert(id: ID!, quantity: Int = 1): AdvertMutationResult
    cancelAdvertReservation(id: ID!): AdvertMutationResult
    collectAdvert(id: ID!, quantity: Int = 1): AdvertMutationResult
    archiveAdvert(id: ID!): AdvertMutationResult
    unarchiveAdvert(id: ID!): AdvertMutationResult
    cancelAdvertClaim(
      id: ID!
      by: String!
      type: AdvertClaimType!
    ): AdvertMutationResult
    convertAdvertClaim(
      id: ID!
      by: String!
      type: AdvertClaimType!
      newType: AdvertClaimType!
    ): AdvertMutationResult
  }

  type AdvertMutationStatus {
    code: String!
    message: String!
    field: String
  }

  type AdvertMutationResult {
    status: AdvertMutationStatus
    advert: Advert!
  }

  input StringFilterInput {
    ne: String
    eq: String
    gt: String
    gte: String
    lt: String
    lte: String
    contains: String
    in: [String]
  }

  enum AdvertClaimType {
    reserved
    collected
  }
  enum AdvertSortableFieldEnum {
    id
    title
    createdAt
  }

  input AdvertFieldsFilterInput {
    id: StringFilterInput
    title: StringFilterInput
    description: StringFilterInput
    unit: StringFilterInput
    material: StringFilterInput
    condition: StringFilterInput
    usage: StringFilterInput
    category: StringFilterInput
    externalId: StringFilterInput
    and: [AdvertFieldsFilterInput]
    or: [AdvertFieldsFilterInput]
    not: AdvertFieldsFilterInput
  }

  input AdvertRestrictionsInput {
    canBeReserved: Boolean
    reservedByMe: Boolean
    createdByMe: Boolean
    isArchived: Boolean
    hasReservations: Boolean
    hasCollects: Boolean
  }

  input AdvertSortingInput {
    field: AdvertSortableFieldEnum
    ascending: Boolean
  }

  input AdvertPagingInput {
    cursor: String
    limit: Int
  }

  input AdvertFilterInput {
    search: String
    fields: AdvertFieldsFilterInput
    restrictions: AdvertRestrictionsInput
    sorting: AdvertSortingInput
    paging: AdvertPagingInput
  }

  input AdvertLocationInput {
    adress: String
    zipCode: String
    city: String
    country: String
  }

  input AdvertContactInput {
    phone: String
    email: String
  }

  input AdvertInput {
    title: String
    description: String
    images: [ImageInput]
    quantity: Int
    unit: String
    material: String
    condition: String
    usage: String
    category: String
    externalId: String

    location: AdvertLocationInput
    contact: AdvertContactInput
  }

  type AdvertClaim {
    quantity: Int
    by: String
    at: String
    type: AdvertClaimType
    canCancel: Boolean
    canConvert: Boolean
  }

  type AdvertMeta {
    reservableQuantity: Int!
    collectableQuantity: Int!
    isMine: Boolean!
    canEdit: Boolean!
    canArchive: Boolean!
    canUnarchive: Boolean!
    canRemove: Boolean!
    canBook: Boolean!
    canReserve: Boolean!
    canCancelReservation: Boolean!
    canCollect: Boolean!
    canManageClaims: Boolean!
    reservedyMe: Int!
    collectedByMe: Int!
    claims: [AdvertClaim]!
  }

  type AdvertLocation {
    adress: String
    zipCode: String
    city: String
    country: String
  }

  type AdvertContact {
    phone: String
    email: String
  }

  input ImageInput {
    url: String
  }

  type Image {
    url: String
  }

  type Advert {
    id: ID!
    createdAt: String
    archivedAt: String
    meta: AdvertMeta
    title: String
    description: String
    quantity: Int
    images: [Image]
    unit: String
    material: String
    condition: String
    usage: String
    category: String
    externalId: String
    location: AdvertLocation
    contact: AdvertContact
  }

  type AdvertList {
    adverts: [Advert]
    nextCursor: String
  }
`
