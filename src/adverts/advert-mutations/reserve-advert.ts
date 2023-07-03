import { transact } from '../../transactions'
import { Services } from '../../types'
import { Advert, AdvertMutations } from '../types'
import { mapTxResultToAdvertMutationResult } from './mappers'
import { verifyReservationLimits, verifyTypeIsReservation } from './verifiers'

export const createReserveAdvert = ({ adverts }: Pick<Services, 'adverts'>): AdvertMutations['reserveAdvert'] => 
	(user, id, quantity) => transact<Advert>({
		load: () => adverts.getAdvert(id),
		saveVersion: (versionId, advert) => adverts.saveAdvertVersion(versionId, advert),
		patch: async (advert, actions) => {
			if (quantity > 0) {
			// TODO: notify
			// actions.push(reservationNotification())
				return ({
					...advert,
					reservations: [ ...advert.reservations, {
						reservedBy: user.id,
						reservedAt: new Date().toISOString(),
						quantity,
					} ],
				})
			}
			return advert
		},
		verify: async (ctx) => {
			[
				verifyTypeIsReservation,
				verifyReservationLimits,
			].map(v => v(ctx))
			return ctx.update
		} })
		.then(mapTxResultToAdvertMutationResult)