export const advertsGqlSchema = /* GraphQL */ `
  type Query {
    adverts(filter: AdvertFilterInput): AdvertList
    getAdvert(id: ID!): Advert
    advertSummaries: AdvertSummaries
  }

  type Mutation {
    createAdvert(input: AdvertInput!): AdvertMutationResult
    updateAdvert(id: ID!, input: AdvertInput!): AdvertMutationResult
    removeAdvert(id: ID!): AdvertMutationResult
    reserveAdvert(
      id: ID!
      quantity: Int = 1
      pickupLocation: PickupLocationInput
    ): AdvertMutationResult
    cancelAdvertReservation(id: ID!): AdvertMutationResult
    collectAdvert(id: ID!, quantity: Int = 1): AdvertMutationResult
    archiveAdvert(id: ID!): AdvertMutationResult
    unarchiveAdvert(id: ID!): AdvertMutationResult
    cancelAdvertClaim(
      id: ID!
      by: String!
      type: AdvertClaimType!
      impersonate: ProfileInput
    ): AdvertMutationResult
    convertAdvertClaim(
      id: ID!
      by: String!
      type: AdvertClaimType!
      newType: AdvertClaimType!
      impersonate: ProfileInput
    ): AdvertMutationResult
    renewAdvertClaim(
      id: ID!
      by: String!
      type: AdvertClaimType!
      impersonate: ProfileInput
    ): AdvertMutationResult
    returnAdvert(id: ID!): AdvertMutationResult
    joinAdvertWaitlist(id: ID!): AdvertMutationResult
    leaveAdvertWaitlist(id: ID!): AdvertMutationResult
    markAdvertAsPicked(id: ID!): AdvertMutationResult
    markAdvertAsUnpicked(id: ID!): AdvertMutationResult
    patchAdvertTags(
      id: ID!
      add: [String]!
      remove: [String]!
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
    reservedAt
    collectedAt
    returnedAt
    description
    notes
    lendingPeriod
    unit
    width
    height
    depth
    weight
    material
    condition
    usage
    reference
    externalId
    tags
    size
    place
  }

  input AdvertFieldsFilterInput {
    id: StringFilterInput
    title: StringFilterInput
    description: StringFilterInput
    unit: StringFilterInput
    width: StringFilterInput
    height: StringFilterInput
    depth: StringFilterInput
    weight: StringFilterInput
    material: StringFilterInput
    condition: StringFilterInput
    usage: StringFilterInput
    category: StringFilterInput
    reference: StringFilterInput
    externalId: StringFilterInput
    tags: StringFilterInput
    size: StringFilterInput
    place: StringFilterInput
    and: [AdvertFieldsFilterInput]
    or: [AdvertFieldsFilterInput]
    not: AdvertFieldsFilterInput
  }

  input AdvertRestrictionsInput {
    canBeReserved: Boolean
    reservedByMe: Boolean
    collectedByMe: Boolean
    createdByMe: Boolean
    editableByMe: Boolean
    isArchived: Boolean
    isPicked: Boolean
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

  input AdvertWorkflowInput {
    pickupLocationTrackingNames: [String]
    places: [String]
  }

  input AdvertFilterInput {
    search: String
    fields: AdvertFieldsFilterInput
    restrictions: AdvertRestrictionsInput
    sorting: AdvertSortingInput
    paging: AdvertPagingInput
    workflow: AdvertWorkflowInput
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
    lendingPeriod: Int
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
    notes: String
    tags: [String]
    location: AdvertLocationInput
    contact: AdvertContactInput
    place: String
  }
  enum AdvertClaimEventType {
    reminder
  }

  type AdvertClaimEvent {
    type: AdvertClaimEventType
    at: String
  }

  type AdvertClaimPickupLocation {
    trackingName: String
  }
  type AdvertClaim {
    quantity: Int
    by: String
    at: String
    type: AdvertClaimType
    events: [AdvertClaimEvent]
    pickupLocation: AdvertClaimPickupLocation
    canCancel: Boolean
    canConvert: Boolean
    isOverdue: Boolean
  }

  type AdvertMeta {
    reservableQuantity: Int!
    collectableQuantity: Int!
    isMine: Boolean!
    canEdit: Boolean!
    canArchive: Boolean!
    canUnarchive: Boolean!
    canPick: Boolean!
    canUnpick: Boolean!
    canRemove: Boolean!
    canBook: Boolean!
    canReserve: Boolean!
    canCancelReservation: Boolean!
    canJoinWaitList: Boolean!
    canLeaveWaitList: Boolean!
    canCollect: Boolean!
    canManageClaims: Boolean!
    canReturn: Boolean!
    reservedyMe: Int!
    collectedByMe: Int!
    isLendingAdvert: Boolean!
    isReservedBySome: Boolean!
    isCollectedBySome: Boolean!
    isPicked: Boolean!
    waitlistCount: Int!
    returnInfo: [AdvertReturnInfo]!
    claims: [AdvertClaim]!
    hasPickupLocations: Boolean!
  }

  type AdvertReturnInfo {
    at: String!
    quantity: Int!
    isMine: Boolean!
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
    reservedAt: String
    collectedAt: String
    returnedAt: String
    meta: AdvertMeta
    title: String
    description: String
    quantity: Int
    lendingPeriod: Int
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
    notes: String
    tags: [String]
    location: AdvertLocation
    contact: AdvertContact
    place: String
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

  type AdvertSummaries {
    totalLendingAdverts: Int!
    totalRecycleAdverts: Int!
    availableLendingAdverts: Int!
    availableRecycleAdverts: Int!
    availableAdverts: Int!
    totalAdverts: Int!
    reservedAdverts: Int!
    collectedAdverts: Int!
  }
`
