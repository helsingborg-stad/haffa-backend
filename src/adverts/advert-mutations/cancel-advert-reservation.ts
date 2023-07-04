import { HaffaUser } from '../../login/types'
import { transact } from '../../transactions'
import { Services } from '../../types'
import { Advert, AdvertMutations, AdvertReservation } from '../types'
import { mapTxResultToAdvertMutationResult } from './mappers'

const countReservationsByUser = (user: HaffaUser, reservations: AdvertReservation[]): number => 
	reservations.filter(({ reservedBy }) => reservedBy === user.id).reduce((s, { quantity }) => s + quantity, 0)
	
export const createCancelAdvertReservation = ({ adverts, notifications }: Pick<Services, 'adverts'|'notifications'>): AdvertMutations['cancelAdvertReservation'] => 
	(user, id) => 
		transact<Advert>({
			load: () => adverts.getAdvert(id),
			patch: async (advert, actions) => {
				actions((patched, original) => notifications.advertReservationWasCancelled(
					user, 
					countReservationsByUser(user, original.reservations),
					patched))
				return {
					...advert,
					reservations: advert.reservations.filter(({ reservedBy }) => reservedBy !== user.id),
				}
			},
			verify: async (ctx) => ctx.update,
			saveVersion: (versionId, advert) => adverts.saveAdvertVersion(versionId, advert),
		})
			.then(mapTxResultToAdvertMutationResult)
