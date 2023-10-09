export const advertProps = `
	id
	title
	description
	images {
		url
	}
	quantity
	unit
	material
	condition
	usage
	category
	reference
	externalId
	contact {
		email
		phone
		organization
	}
	location {
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
