import * as uuid from 'uuid'

export interface TxCommitAction {
	(): Promise<void>
}

export interface TxCommitActions {
	(action: TxCommitAction): void
}

export interface TxCtx<T> {
	maxRetries?: number, retryDelay?: number,
	load: () => Promise<T|null>,
	saveVersion: (versionId: string, data: T) =>  Promise<T|null>,
	patch: (data: T, actions: TxCommitActions) => Promise<T|null>,
	verify: (ctx: {update: T, original: T, thrw: (error: TxError) => void}) => Promise<T|null>
}

export interface TxError {
	code: string,
	message: string,
	field?: string
}

export interface TxResult<T> {
	error: TxError | null,
	data: T,
	attempts: number
}

class TransactionError extends Error {
	error: TxError
	constructor(error: TxError) {
		super(error.message)
		this.error = error
	}
}

const thrw = (error: TxError): never => {
	throw new TransactionError(error)
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const runTransaction = async <T extends {versionId: string}>(
	{ load, saveVersion, patch, verify }: TxCtx<T>
): Promise<Omit<TxResult<T>,'attempts'> & {shouldRetry?: boolean, commitActions?: TxCommitAction[]}| null> => {
	const commitActions: TxCommitAction[] = []
	const original = await load()
	if (!original) {
		return null
	}

	const update = await patch(original, action => commitActions.push(action))
	if (!update) {
		return null
	}

	try {
		const verified = await verify({
			update,
			original,
			thrw,
		})

		if (!verified) {
			return null
		}
	
		update.versionId = uuid.v4().split('-').join()
	
		const saved = await saveVersion(original.versionId, verified)
		if (!saved) {
			return {
				shouldRetry: true,
				data: original,
				error: {
					code: 'HAFFA_ERROR_CONFLICT',
					message: 'Uppdateringen kunde inte genomföras utan konflikt',
				},
			}
		}
		return {
			error: null,
			data: saved,
			commitActions,
		}
	} catch (e) {
		if (e instanceof TransactionError) {
			return {
				error: e.error,
				data: original,
			}
		}
		throw e
	}
}

export const transact = async <T extends {versionId: string}>(ctx: TxCtx<T>): Promise<TxResult<T>|null> => {
	let retriesLeft = Math.max(1, Number(ctx.maxRetries || 1) || 1)
	const wait = Math.min(1, Number(ctx.retryDelay || 100) || 100)

	let attempts = 0
	while (true) {
		attempts = attempts + 1
		retriesLeft = retriesLeft - 1 
		const result = await runTransaction(ctx)
		if (result === null) {
			return null
		}
		const { shouldRetry: shouldRetry, data, error, commitActions } = result

		if (shouldRetry) {
			if (retriesLeft <= 0) {
				return { data, error, attempts }
			}
			await delay(wait)
			continue
		}

		if (error) {
			return { data, error, attempts }
		}

		await Promise.all((commitActions || []).filter(action => action).map(action=> action()))
		return { data, error: null, attempts }
	}
	return null
}
