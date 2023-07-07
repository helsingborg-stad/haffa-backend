import { transact, txBuilder } from '../../transactions'
import type { Services } from '../../types'
import type { Advert, AdvertMutations } from '../types'
import { mapTxResultToAdvertMutationResult } from './mappers'
import { processAdvertInput } from './process-advert-input'
import { verifyAll, verifyQuantityAtleatOne, verifyReservationsDoesNotExceedQuantity } from './verifiers'


export const createUpdateAdvert = ({ adverts, files }: Pick<Services, 'adverts'|'files'>): AdvertMutations['updateAdvert'] => 
	(user, id, input) => txBuilder<Advert>()
		.load(() => adverts.getAdvert(id))
		.patch(async ({data: advert}) => ({
		...advert,
		...await processAdvertInput(input, files),
	}))
	.verify(async (ctx) => verifyAll(ctx, verifyQuantityAtleatOne, verifyReservationsDoesNotExceedQuantity))
	.saveVersion((versionId, advert) => adverts.saveAdvertVersion(versionId, advert))
	.run()
	.then(mapTxResultToAdvertMutationResult)


/*
	(user, id, input) => transact<Advert>({
				load: () => adverts.getAdvert(id),
				patch: async ({data: advert}) => ({
					...advert,
					...await processAdvertInput(input, files),
				}),
				verify: async (ctx) => verifyAll(ctx, verifyQuantityAtleatOne, verifyReservationsDoesNotExceedQuantity),
				saveVersion: (versionId, advert) => adverts.saveAdvertVersion(versionId, advert),
			})
			.then(mapTxResultToAdvertMutationResult)
*/