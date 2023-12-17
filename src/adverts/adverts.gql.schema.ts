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
    categories: [Category]
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

  enum AdvertType {
    recycle
    borrow
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
    reference: StringFilterInput
    externalId: StringFilterInput
    tags: StringFilterInput
    and: [AdvertFieldsFilterInput]
    or: [AdvertFieldsFilterInput]
    not: AdvertFieldsFilterInput
  }

  input AdvertRestrictionsInput {
    canBeReserved: Boolean
    reservedByMe: Boolean
    collectedByMe: Boolean
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
    pageIndex: Int
    pageSize: Int

    limit: Int
    cursor: String
  }

  input AdvertFilterInput {
    search: String
    fields: AdvertFieldsFilterInput
    restrictions: AdvertRestrictionsInput
    sorting: AdvertSortingInput
    paging: AdvertPagingInput
  }

  input AdvertLocationInput {
    name: String
    adress: String
    zipCode: String
    city: String
    country: String
  }

  input AdvertContactInput {
    phone: String
    email: String
    organization: String
  }

  input AdvertInput {
    title: String
    description: String
    images: [ImageInput]
    quantity: Int
    unit: String
    width: String
    height: String
    depth: String
    weight: String
    size: String
    material: String
    condition: String
    usage: String
    category: String
    reference: String
    externalId: String
    tags: [String]
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
    name: String
    adress: String
    zipCode: String
    city: String
    country: String
  }

  type AdvertContact {
    phone: String
    email: String
    organization: String
  }

  input ImageInput {
    url: String
  }

  type Image {
    url: String
  }

  type Advert {
    id: ID!
    type: AdvertType
    createdAt: String
    archivedAt: String
    meta: AdvertMeta
    title: String
    description: String
    quantity: Int
    images: [Image]
    unit: String
    width: String
    height: String
    depth: String
    weight: String
    size: String
    material: String
    condition: String
    usage: String
    category: String
    reference: String
    externalId: String
    tags: [String]
    location: AdvertLocation
    contact: AdvertContact
  }

  type AdvertListPaging {
    totalCount: Int!
    pageCount: Int!
    pageIndex: Int!
    pageSize: Int!
    nextCursor: String
  }

  type AdvertList {
    adverts: [Advert]
    categories: [Category]
    paging: AdvertListPaging!
  }
`
