import { txBuilder } from '../../transactions'
import type { Services } from '../../types'
import type { Advert, AdvertMutations } from '../types'
import { mapTxResultToAdvertMutationResult } from './mappers'
import { verifyAll, verifyReservationLimits, verifyTypeIsReservation } from './verifiers'

export const createReserveAdvert = ({ adverts, notifications }: Pick<Services, 'adverts'|'notifications'>): AdvertMutations['reserveAdvert'] => 
	(user, id, quantity) => txBuilder<Advert>()
		.load(() => adverts.getAdvert(id))
		.validate(() => {})
		.patch((advert, {actions}) => {
			if (quantity > 0) {
				actions((patched) => notifications.advertWasReserved(user, quantity, patched))
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
		})
		.verify((_, ctx) => verifyAll(
			ctx,
				verifyTypeIsReservation,
				verifyReservationLimits,
			))
		.saveVersion( (versionId, advert) => adverts.saveAdvertVersion(versionId, advert))
		.run()
		.then(mapTxResultToAdvertMutationResult)