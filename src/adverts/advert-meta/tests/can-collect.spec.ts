import { getAdvertMeta } from ".."
import type { HaffaUser } from "../../../login/types"
import { createEmptyAdvert } from "../../mappers"
import type { AdvertCollect, AdvertReservation} from "../../types";
import { AdvertType } from "../../types"

describe('getAdvertMeta::canCollect', () => {
	const testUser: HaffaUser = {id: 'test@user', roles: []}

	const createReservation = (defaults?: Partial<AdvertReservation>): AdvertReservation => ({reservedBy: testUser.id, reservedAt: new Date().toISOString(), quantity: 1, ...defaults})
	const createCollect = (defaults?: Partial<AdvertCollect>): AdvertCollect => ({collectedBy: testUser.id, collectedAt: new Date().toISOString(), quantity: 1, ...defaults})

	const collectableAdverts = [
		createEmptyAdvert({quantity: 1}),
		createEmptyAdvert({quantity: 1, reservations: [createReservation({quantity: 1})]}),
		createEmptyAdvert({quantity: 2, reservations: [
			createReservation({quantity: 1}),
			createReservation({quantity: 1}),
		]}),
		createEmptyAdvert({quantity: 2, reservations: [
			createReservation({quantity: 1, reservedBy: 'someone@else'}),
		]}),
		createEmptyAdvert({quantity: 2, reservations: [
			createReservation({quantity: 1, reservedBy: 'someone@else'}),
			createReservation({quantity: 1}),
		]}),
	]

	const uncollctableAdverts = [
		createEmptyAdvert({quantity: 1, type: AdvertType.borrow}),
		createEmptyAdvert({quantity: 1, reservations: [createReservation({reservedBy: 'someone@else'})]}),
		createEmptyAdvert({quantity: 1, collects: [createCollect()]}),
	]

	it('allows', () => {
		collectableAdverts.forEach(advert => expect(getAdvertMeta(advert, testUser).canCollect).toBe(true))
	})
	it('denies', () => {
		uncollctableAdverts.forEach(advert => expect(getAdvertMeta(advert, testUser).canCollect).toBe(false))
	})
})
