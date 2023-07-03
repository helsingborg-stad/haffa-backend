import { TxVerifyContext } from '../../transactions'
import { Advert, AdvertType } from '../types'

export const verifyTypeIsReservation = ({ update, throwIf }: TxVerifyContext<Advert>): void => throwIf(update.type !== AdvertType.recycle, {
	code: 'EADVERT_',
	message: 'Endast återbruksannonser kan reserveras',
})

export const verifyReservationLimits = ({ update, throwIf }: TxVerifyContext<Advert>): void => throwIf(
	update.quantity < update.reservations.reduce((s, { quantity }) => s+quantity, 0),
	{
		code: 'EADVERT_',
		message: 'För många reservationer',
	}

)
