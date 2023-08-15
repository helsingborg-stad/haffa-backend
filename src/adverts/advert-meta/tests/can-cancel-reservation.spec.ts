import { getAdvertMeta } from ".."
import type { HaffaUser } from "../../../login/types"
import { createEmptyAdvert } from "../../mappers"
import type { AdvertClaim} from "../../types";
import { AdvertClaimType, AdvertType } from "../../types"

describe('getAdvertMeta::canCancelReservation', () => {
	const testUser: HaffaUser = {id: 'test@user', roles: []}

	const createReservation = (defaults?: Partial<AdvertClaim>): AdvertClaim => ({by: testUser.id, at: new Date().toISOString(), quantity: 1, type: AdvertClaimType.reserved, ...defaults})

	const cancellableAdverts = [
		createEmptyAdvert({quantity: 1, claims: [createReservation({quantity: 1})]}),
		createEmptyAdvert({quantity: 2, claims: [
			createReservation({quantity: 1}),
			createReservation({quantity: 1}),
		]}),
		createEmptyAdvert({quantity: 2, claims: [
			createReservation({quantity: 1, by: 'someone@else'}),
			createReservation({quantity: 1}),
		]}),
	]

	const uncancellableAdverts = [
		createEmptyAdvert({quantity: 1, type: AdvertType.recycle}),
		createEmptyAdvert({quantity: 1, type: AdvertType.borrow}),
		createEmptyAdvert({quantity: 2, claims: [createReservation({quantity: 2, by: 'someone@else'})]}),
		createEmptyAdvert({quantity: 2, claims: [
			createReservation({quantity: 1, by: 'someone@else'}),
			createReservation({quantity: 1, by: 'someone@else'})]}),
	]

	it('allows', () => {
		cancellableAdverts.forEach(advert => expect(getAdvertMeta(advert, testUser).canCancelReservation).toBe(true))
	})
	it('denies', () => {
		uncancellableAdverts.forEach(advert => expect(getAdvertMeta(advert, testUser).canCancelReservation).toBe(false))
	})
})
