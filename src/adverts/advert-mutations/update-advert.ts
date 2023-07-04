import { transact } from '../../transactions'
import type { Services } from '../../types'
import type { Advert, AdvertMutations } from '../types'
import { mapTxResultToAdvertMutationResult } from './mappers'
import { processAdvertInput } from './process-advert-input'

export const createUpdateAdvert = ({ adverts, files }: Pick<Services, 'adverts'|'files'>): AdvertMutations['updateAdvert'] => 
	(user, id, input) => 
		processAdvertInput(input, files)
			.then(convertedInput => transact<Advert>({
				load: () => adverts.getAdvert(id),
				patch: async (advert) => ({
					...advert,
					...convertedInput,
				}),
				verify: async (ctx) => ctx.update,
				saveVersion: (versionId, advert) => adverts.saveAdvertVersion(versionId, advert),
			}))
			.then(mapTxResultToAdvertMutationResult)
