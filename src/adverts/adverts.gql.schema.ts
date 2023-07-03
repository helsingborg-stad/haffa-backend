export const advertsGqlSchema = /* GraphQL */`

type Query {
	adverts(filter: FilterAdvertsInput): [Advert]
	getAdvert(id: ID!): Advert
}

type Mutation {
	createAdvert(input: AdvertInput!): AdvertMutationResult
	updateAdvert(id: ID!, input: AdvertInput!): AdvertMutationResult
	reserveAdvert(id: ID!, quantity: Int): AdvertMutationResult
}

type AdvertMutationStatus {
	code: String
	message: String
}

type AdvertMutationResult {
	status: AdvertMutationStatus
	advert: Advert
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

input AdvertInput {
	title: String
	description: String
	images: [ImageInput]
	quantity: Int
	unit: String
	material: String
	condition: String
	usage: String
}

type AdvertMeta {
	canEdit: Boolean!
	canDelete: Boolean!
	canBook: Boolean!
	canReserve: Boolean!
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
}
`