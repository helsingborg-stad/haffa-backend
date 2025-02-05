export const advertProps = `
	id
	title
	description
	images {
		url
	}
	quantity
	lendingPeriod
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
	notes
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
	place
`

export const advertWithMetaProps = `
	id
	title
	description
	images {
		url
	}
	quantity
	lendingPeriod
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
	notes
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
	place
	meta {
		reservableQuantity
		collectableQuantity
		isMine
		canEdit
		canArchive
		canUnarchive
		canRemove
		canBook
		canReserve
		canCancelReservation
		canCollect
		canManageClaims
		canReturn
    	reservedyMe
    	collectedByMe
		claims {
			by
			at
			quantity
			type
			canCancel
			canConvert
		}
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
