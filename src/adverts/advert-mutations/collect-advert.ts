import { TxErrors, txBuilder } from '../../transactions'
import type { Services } from '../../types'
import { getAdvertMeta } from '../advert-meta'
import type { Advert, AdvertMutations } from '../types'
import { mapTxResultToAdvertMutationResult } from './mappers'
import { verifyAll, verifyReservationLimits, verifyReservationsDoesNotExceedQuantity, verifyTypeIsReservation } from './verifiers'

export const createCollectAdvert = ({ adverts, notifications }: Pick<Services, 'adverts'|'notifications'>): AdvertMutations['reserveAdvert'] => 
	(user, id, quantity) => txBuilder<Advert>()
		.load(() => adverts.getAdvert(user, id))
		.validate(async (advert, { throwIf }) => throwIf(!getAdvertMeta(advert, user).canCollect, TxErrors.Unauthorized))
		.patch((advert, {actions}) => {
			if (quantity > 0) {
				actions((patched) => notifications.advertWasCollected(user, quantity, patched))

				const reservedByMe = advert
					.reservations
					.filter(({ reservedBy }) => reservedBy === user.id)
					.map(({ quantity }) => quantity)
					.reduce((s, v) => s + v, 0)
/*
				const collectedByMe = advert
					.collects
					.filter(({ collectedBy }) => collectedBy === user.id)
					.map(({ quantity }) => quantity)
					.reduce((s, v) => s + v, 0)
*/
				// we can collect without reservation
				const lastMinuteReservations = (quantity > reservedByMe) 
					? [{reservedBy: user.id, reservedAt: new Date().toISOString(), quantity: quantity - reservedByMe}]
					: []
				return ({
					...advert,
					reservations: [...advert.reservations, ...lastMinuteReservations],
					collects: [ ...advert.collects, {
						collectedBy: user.id,
						collectedAt: new Date().toISOString(),
						quantity
					}]
				})
			}
			return advert
		})
		.verify((_, ctx) => verifyAll(
			ctx,
				verifyTypeIsReservation, verifyReservationLimits, verifyReservationsDoesNotExceedQuantity
			))
		.saveVersion( (versionId, advert) => adverts.saveAdvertVersion(user, versionId, advert))
		.run()
		.then(mapTxResultToAdvertMutationResult)