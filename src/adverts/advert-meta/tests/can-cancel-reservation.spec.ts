import { getAdvertMeta } from ".."
import type { HaffaUser } from "../../../login/types"
import { createEmptyAdvert } from "../../mappers"
import type { AdvertReservation} from "../../types";
import { AdvertType } from "../../types"

describe('getAdvertMeta::canCancelReservation', () => {
	const testUser: HaffaUser = {id: 'test@user', roles: []}

	const createReservation = (defaults?: Partial<AdvertReservation>): AdvertReservation => ({reservedBy: testUser.id, reservedAt: new Date().toISOString(), quantity: 1, ...defaults})

	const cancellableAdverts = [
		createEmptyAdvert({quantity: 1, reservations: [createReservation({quantity: 1})]}),
		createEmptyAdvert({quantity: 2, reservations: [
			createReservation({quantity: 1}),
			createReservation({quantity: 1}),
		]}),
		createEmptyAdvert({quantity: 2, reservations: [
			createReservation({quantity: 1, reservedBy: 'someone@else'}),
			createReservation({quantity: 1}),
		]}),
	]

	const uncancellableAdverts = [
		createEmptyAdvert({quantity: 1, type: AdvertType.recycle}),
		createEmptyAdvert({quantity: 1, type: AdvertType.borrow}),
		createEmptyAdvert({quantity: 2, reservations: [createReservation({quantity: 2, reservedBy: 'someone@else'})]}),
		createEmptyAdvert({quantity: 2, reservations: [
			createReservation({quantity: 1, reservedBy: 'someone@else'}),
			createReservation({quantity: 1, reservedBy: 'someone@else'})]}),
	]

	it('allows', () => {
		cancellableAdverts.forEach(advert => expect(getAdvertMeta(advert, testUser).canCancelReservation).toBe(true))
	})
	it('denies', () => {
		uncancellableAdverts.forEach(advert => expect(getAdvertMeta(advert, testUser).canCancelReservation).toBe(false))
	})
})
