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
	externalId
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
