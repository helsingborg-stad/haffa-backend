import { TxError, TxResult } from '../../transactions'
import { Advert, AdvertMutationResult, AdvertMutationStatus } from '../types'

export const mapTxErrorToAdvertMutationStatus = (error?: TxError): AdvertMutationStatus => error ? ({
	code: error.code,
	message: error.message,
	field: error.field || '',
}) : null

export const mapTxResultToAdvertMutationResult = (result: TxResult<Advert>): AdvertMutationResult => ({
	advert: result.data,
	status: mapTxErrorToAdvertMutationStatus(result.error),
})
