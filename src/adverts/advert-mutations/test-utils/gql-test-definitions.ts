export const advertProps = `
	id
	title
	description
	images {
		url
	}
	quantity
	unit
	width
	height
	depth
	weight
	size
	material
	condition
	usage
	category
	reference
	externalId
	tags
	contact {
		email
		phone
		organization
	}
	location {
		name
		adress
		zipCode
		city
		country
	}
`

export const mutationProps = `
	advert {
		${advertProps}
	}
	status {
		code
		message
		field
	}
`
