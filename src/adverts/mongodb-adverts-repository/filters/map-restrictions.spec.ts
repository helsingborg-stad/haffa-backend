import type { HaffaUser } from "../../../login/types"
import { mapRestrictions } from "./map-restrictions"

describe('mapRestrictions', () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const user: HaffaUser = {
		id: 'test@user',
		roles: []
	}

	it('maps empty or not set to null', () => {
		expect(mapRestrictions(user)).toBeNull()
		expect(mapRestrictions(user, undefined)).toBeNull()
		expect(mapRestrictions(user, {})).toBeNull()
	})

	it('maps canBeReserved', () => {
		expect(mapRestrictions(user, {canBeReserved: true})).toMatchObject({
			'meta.unreservedCount': { $gt: 0 }
		})
		expect(mapRestrictions(user, {canBeReserved: false})).toMatchObject({
			'meta.unreservedCount': 0
		})
	})

	it('maps createByMe', () => {
		expect(mapRestrictions(user, {createdByMe: true})).toMatchObject({
			'advert.createdBy': user.id
		})
		expect(mapRestrictions(user, {createdByMe: false})).toMatchObject({
			'advert.createdBy': {$ne: user.id}
		})
	})
})