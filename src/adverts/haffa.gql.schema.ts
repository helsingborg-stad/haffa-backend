export const haffaGqlSchema = `

input IdFilterInput {
	ne: String
	eq: String
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
	id: IdFilterInput
	title: StringFilterInput
	description: StringFilterInput

	and: [FilterAdvertsInput]
	or: [FilterAdvertsInput]
	not: FilterAdvertsInput
}

input CreateAdvertInput {
	title: String
	description: String
	unit: String
	material: String
	condition: String
	usage: String
}

type AdvertPermissions {
	edit: Boolean!
	delete: Boolean!
	book: Boolean!
	claim: Boolean!
}

type Advert {
	permissions: AdvertPermissions
	id: ID!
	title: String
	description: String
	unit: String
	material: String
	condition: String
	usage: String
}

type Terms {
	unit: [String]
	material: [String]
	condition: [String]
	usage: [String]
}


type Query {
	terms: Terms!
	adverts(filter: FilterAdvertsInput): [Advert]
	getAdvert(id: ID!): Advert
}

type Mutation {
	createAdvert(input: CreateAdvertInput!): Advert
}

`