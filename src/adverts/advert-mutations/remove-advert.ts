import { TxErrors, txBuilder } from '../../transactions'
import type { Services } from '../../types'
import { getAdvertMeta } from '../advert-meta'
import type { Advert, AdvertMutations } from '../types'
import { mapTxResultToAdvertMutationResult } from './mappers'

export const createRemoveAdvert = ({ adverts }: Pick<Services, 'adverts'>): AdvertMutations['removeAdvert'] => 
	async (user, id) => txBuilder<Advert>()
		.load(() => adverts.getAdvert(user, id))
		.validate(async (advert, {throwIf}) => throwIf(!getAdvertMeta(advert, user).canRemove, TxErrors.Unauthorized))
		.patch(async (data) => data)
		.verify(async (update) => update)
		.saveVersion(async () => adverts.remove(user, id))
		.run()
		.then(mapTxResultToAdvertMutationResult)




