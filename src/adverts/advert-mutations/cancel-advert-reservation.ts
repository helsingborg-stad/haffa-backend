import { transact } from '../../transactions'
import { Services } from '../../types'
import { Advert, AdvertMutations } from '../types'
import { mapTxResultToAdvertMutationResult } from './mappers'

export const createCancelAdvertReservation = ({ adverts }: Pick<Services, 'adverts'>): AdvertMutations['cancelAdvertReservation'] => 
	(user, id) => 
		transact<Advert>({
			load: () => adverts.getAdvert(id),
			patch: async (advert) => ({
				...advert,
				reservations: advert.reservations.filter(({ reservedBy }) => reservedBy !== user.id),
			}),
			verify: async (ctx) => ctx.update,
			saveVersion: (versionId, advert) => adverts.saveAdvertVersion(versionId, advert),
		})
			.then(mapTxResultToAdvertMutationResult)
