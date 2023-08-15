import type { TxVerifyContext } from '../../transactions'
import type { Advert} from '../types';
import { AdvertType } from '../types'

const getClaimCount = (advert: Advert): number => advert.claims.reduce((s, { quantity }) => s + quantity, 0)

export interface Verifier {
	(ctx: TxVerifyContext<Advert>): void
}

export const verifyAll = (ctx: TxVerifyContext<Advert>, ...verifiers: Verifier[]) => {
	verifiers.forEach(v => v(ctx))
	return ctx.update
}



export const verifyTypeIsReservation = ({ update, throwIf }: TxVerifyContext<Advert>): void => throwIf(update.type !== AdvertType.recycle, {
	code: 'EADVERT_',
	message: 'Endast återbruksannonser kan reserveras',
})

export const verifyQuantityAtleatOne = ({update, throwIf}: TxVerifyContext<Advert>): void => throwIf(!(update.quantity >= 1), {
		code: 'EADVERT_',
		message: 'Antalet måste vara minst 1',
		field: 'quantity'
	})

export const verifyReservationsDoesNotExceedQuantity = ({update, throwIf}: TxVerifyContext<Advert>): void => throwIf(update.quantity < getClaimCount(update), {
		code: 'EADVERT_',
		message: 'Antalet reservationer överstiger angivet antal',
		field: 'quantity'
	})


export const verifyReservationLimits = ({ update, throwIf }: TxVerifyContext<Advert>): void => throwIf(
	update.quantity < getClaimCount(update),
	{
		code: 'EADVERT_',
		message: 'För många reservationer',
	}

)
