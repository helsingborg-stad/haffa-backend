import { Services } from '../../types'
import { AdvertMutations } from '../types'
import { processAdvertInput } from './process-advert-input'

export const createCreateAdvert = ({ adverts, files }: Pick<Services, 'adverts'|'files'>): AdvertMutations['createAdvert'] => 
	(user, input) => 
		processAdvertInput(input, files)
			.then(convertedInput => adverts.create(user, convertedInput))
			.then(advert => ({ advert, status: null }))
