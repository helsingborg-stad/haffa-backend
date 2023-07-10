import type { HaffaUser } from '../../login/types'
import { txBuilder } from '../../transactions'
import type { Services } from '../../types'
import type { Advert, AdvertMutations, AdvertReservation } from '../types'
import { mapTxResultToAdvertMutationResult } from './mappers'

const countReservationsByUser = (user: HaffaUser, reservations: AdvertReservation[]): number => 
	reservations.filter(({ reservedBy }) => reservedBy === user.id).reduce((s, { quantity }) => s + quantity, 0)
	
export const createCancelAdvertReservation = ({ adverts, notifications }: Pick<Services, 'adverts'|'notifications'>): AdvertMutations['cancelAdvertReservation'] => 
	(user, id) => txBuilder<Advert>()
		.load(() => adverts.getAdvert(user, id))
		.validate(() => undefined)
		.patch((advert, {actions}) => {
				actions((patched, original) => notifications.advertReservationWasCancelled(
					user, 
					countReservationsByUser(user, original.reservations),
					patched))
				return {
					...advert,
					reservations: advert.reservations.filter(({ reservedBy }) => reservedBy !== user.id),
				}
			})
			.verify((update) => update)
			.saveVersion( (versionId, advert) => adverts.saveAdvertVersion(user, versionId, advert))
			.run()
			.then(mapTxResultToAdvertMutationResult)

