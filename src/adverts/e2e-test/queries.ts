const advertProps = `
	id
	title
	description
	meta {
		canEdit
		canDelete
		canBook
		canReserve
	}
	images {
		url
	}
	quantity
	unit
	material
	condition
	usage
	contact {
		email
		phone
	}
	location {
		adress
		zipCode
		city
		country
	}
`

const mutationProps = `
	advert {
		${advertProps}
	}
	status {
		code
		message
		field
	}
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
		${mutationProps}
	}
  }
`

export const createAdvertMutation = /* GraphQL */`
mutation Mutation(
	$input: AdvertInput!
) {
	createAdvert(input: $input) {
		${mutationProps}
	}
}
`

export const updateAdvertMutation = /* GraphQL */`
mutation Mutation(
	$id: ID!
	$input: AdvertInput!
) {
	updateAdvert(id: $id, input: $input) {
		${mutationProps}
	}
}
`

export const reserveAdvertMutation = /* GraphQL */`
mutation Mutation(
	$id: ID!
	$quantity: Int
) {
	reserveAdvert(id: $id, quantity: $quantity) {
		${mutationProps}
	}
}
`

export const cancelAdvertReservationMutation = /* GraphQL */`
mutation Mutation(
	$id: ID!
) {
	cancelAdvertReservation(id: $id) {
		${mutationProps}
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
