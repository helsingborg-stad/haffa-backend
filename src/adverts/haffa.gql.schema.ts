export const haffaGqlSchema = `

input CreateAdvertInput {
	title: String
	description: String
}

type Advert {
	id: ID!
	title: String
	description: String
}

type Query {
	adverts: [Advert]
}

type Mutation {
	createAdvert(input: CreateAdvertInput!): Advert
}

`