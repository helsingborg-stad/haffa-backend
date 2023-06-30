export const termsGqlSchema = /* GraphQL */`

type Query {
	terms: Terms!
}

type Terms {
	unit: [String]
	material: [String]
	condition: [String]
	usage: [String]
}

`
