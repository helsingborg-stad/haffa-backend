const advertProps = `
	id
	title
	description
	permissions {
		edit
		delete
		book
		claim
	}
	images {
		url
	}
	quantity
	unit
	material
	condition
	usage
`


export const getAdvertQuery = /* GraphQL */`
query Query($id: ID!) {
	getAdvert(id: $id) {
		${advertProps}
	}
  }
 `

export const listAdvertsQuery = /* GraphQL */`
query Query($filter: FilterAdvertsInput) {
	adverts(filter: $filter) {
		${advertProps}
	}
  }
`

export const createAdvertMutation = /* GraphQL */`
mutation Mutation(
	$input: AdvertInput!
) {
	createAdvert(input: $input) {
		${advertProps}
	}
}
`

export const updateAdvertMutation = /* GraphQL */`
mutation Mutation(
	$id: ID!
	$input: AdvertInput!
) {
	updateAdvert(id: $id, input: $input) {
		${advertProps}
	}
}
`

export const getTermsQuery = /* GraphQL */`
query Query {
	terms {
		unit
		material
		condition
		usage
	}
}`
