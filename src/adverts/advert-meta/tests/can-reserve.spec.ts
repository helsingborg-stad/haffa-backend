import { getAdvertMeta } from ".."
import { HaffaUser } from "../../../login/types"
import { createEmptyAdvert } from "../../mappers"
import { AdvertReservation, AdvertType } from "../../types"

describe('getAdvertMeta::canReserve', () => {
	const testUser: HaffaUser = {id: 'test@user', roles: []}

	const createReservation = (defaults?: Partial<AdvertReservation>): AdvertReservation => ({reservedBy: 'test@user', reservedAt: new Date().toISOString(), quantity: 1, ...defaults})

	const reservableAdverts = [
		createEmptyAdvert({quantity: 1}),
		createEmptyAdvert({quantity: 2, reservations: [createReservation({quantity: 1})]}),
		createEmptyAdvert({quantity: 10, reservations: [createReservation({quantity: 9})]}),
	]

	const unreservableAdverts = [
		createEmptyAdvert({quantity: 1, type: AdvertType.borrow}),
		createEmptyAdvert({quantity: 2, reservations: [createReservation({quantity: 2})]}),
		createEmptyAdvert({quantity: 10, reservations: [createReservation({quantity: 9}), createReservation({quantity: 1})]}),

	]

	it('allows reservations if advert.quantity exceeds total reservations', () => {
		reservableAdverts.forEach(advert => expect(getAdvertMeta(advert, testUser).canReserve).toBe(true))
	})
	it('denies reservations if total reservations amounts ot advert.quantity', () => {
		unreservableAdverts.forEach(advert => expect(getAdvertMeta(advert, testUser).canReserve).toBe(false))
	})
})
