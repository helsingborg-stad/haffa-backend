import * as uuid from 'uuid'

export interface TxCommitAction<T> {
	(value: T, originalValue: T): Promise<void>
}

export interface TxCommitActions<T> {
	(action: TxCommitAction<T>): void
}

export interface TxVerifyContext<T> {
	update: T,
	original: T,
	throwIf: (condition: boolean, error: TxError) => void
}
export interface TxCtx<T> {
	maxRetries?: number, retryDelay?: number,
	load: () => Promise<T|null>,
	saveVersion: (versionId: string, data: T) =>  Promise<T|null>,
	patch: (data: T, actions: TxCommitActions<T>) => Promise<T|null>,
	verify: (ctx: TxVerifyContext<T>) => Promise<T|null>
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

const throwIf = (condition: boolean, error: TxError): void => {
	if (condition) { 
		throw new TransactionError(error)
	}
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const runTransaction = async <T extends {versionId: string}>(
	{ load, saveVersion, patch, verify }: TxCtx<T>
): Promise<Omit<TxResult<T>,'attempts'> & {
	shouldRetry?: boolean, 
	commitActions?: TxCommitAction<T>[],
	original: T,
	}| null> => {
	const commitActions: TxCommitAction<T>[] = []
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
			throwIf,
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
				original,
				error: {
					code: 'HAFFA_ERROR_CONFLICT',
					message: 'Uppdateringen kunde inte genomföras utan konflikt',
				},
			}
		}
		return {
			error: null,
			original,
			data: saved,
			commitActions,
		}
	} catch (e) {
		if (e instanceof TransactionError) {
			return {
				error: e.error,
				original,
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
		const { shouldRetry: shouldRetry, data, original, error, commitActions } = result

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

		await Promise.all((commitActions || []).filter(action => action).map(action=> action(data, original)))
		return { data, error: null, attempts }
	}
	return null
}
