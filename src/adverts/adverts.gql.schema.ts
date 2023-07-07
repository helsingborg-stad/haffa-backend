export const advertsGqlSchema = /* GraphQL */`

type Query {
	adverts(filter: FilterAdvertsInput): [Advert]
	getAdvert(id: ID!): Advert
}

type Mutation {
	createAdvert(input: AdvertInput!): AdvertMutationResult
	updateAdvert(id: ID!, input: AdvertInput!): AdvertMutationResult
	removeAdvert(id: ID!): AdvertMutationResult
	reserveAdvert(id: ID!, quantity: Int): AdvertMutationResult
	cancelAdvertReservation(id: ID!): AdvertMutationResult
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
} 

input FilterAdvertsInput {
	id: StringFilterInput
	title: StringFilterInput
	description: StringFilterInput
	unit: StringFilterInput
	material: StringFilterInput
	condition: StringFilterInput
	usage: StringFilterInput

	and: [FilterAdvertsInput]
	or: [FilterAdvertsInput]
	not: FilterAdvertsInput
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
	
	location: AdvertLocationInput
	contact: AdvertContactInput
}

type AdvertMeta {
	canEdit: Boolean!
	canRemove: Boolean!
	canBook: Boolean!
	canReserve: Boolean!
	canCancelReservation: Boolean!
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
	meta: AdvertMeta
	title: String
	description: String
	quantity: Int
	images: [Image]
	unit: String
	material: String
	condition: String
	usage: String

	location: AdvertLocation
	contact: AdvertContact
}
`