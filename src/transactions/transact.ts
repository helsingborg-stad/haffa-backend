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

export interface TxPatchContext<T> {
	data: T,
	actions: TxCommitActions<T>,
	throwIf: (condition: boolean, error: TxError) => void
}
export interface TxCtx<T> {
	maxRetries?: number, retryDelay?: number,
	load: () => Promise<T|null>,
	saveVersion: (versionId: string, data: T) =>  Promise<T|null>,
	patch: (ctx: TxPatchContext<T>) => Promise<T|null>,
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

const delay = (ms: number) => new Promise(resolve => { setTimeout(resolve, ms) })

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

	const update = await patch({
		data: original, 
		actions: action => commitActions.push(action),
		throwIf
	})
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
	const retriesLeft = Math.max(1, Number(ctx.maxRetries || 1) || 1)
	const wait = Math.min(1, Number(ctx.retryDelay || 100) || 100)
	
	async function nextAttempt(attempts: number, attemptsLeft: number): Promise<TxResult<T>|null> {
		const result = await runTransaction(ctx)
		if (result === null) {
			return null
		}
		const { shouldRetry, data, original, error, commitActions } = result

		if (shouldRetry) {
			if (attemptsLeft <= 1) {
				return { data, error, attempts }
			}
			await delay(wait)
			return nextAttempt(attempts + 1, attemptsLeft - 1)
		}

		if (error) {
			return { data, error, attempts }
		}

		await Promise.all((commitActions || []).filter(action => action).map(action=> action(data, original)))
		return { data, error: null, attempts }
	}

	return nextAttempt(1, retriesLeft)
}

export interface TxBuilder<T> {
	load: (load: TxCtx<T>['load']) => Pick<TxBuilder<T>, 'patch'>,
	patch: (patch: TxCtx<T>['patch']) => Pick<TxBuilder<T>, 'verify'>
	verify: (verify: TxCtx<T>['verify']) => Pick<TxBuilder<T>, 'saveVersion'>
	saveVersion: (saveVersion: TxCtx<T>['saveVersion']) => Pick<TxBuilder<T>,'run'>
	run: (opts?: {
		maxRetries?: number, retryDelay?: number,
	}) => Promise<TxResult<T>|null>,
}

export const txBuilder = <T extends {versionId: string}>(): Pick<TxBuilder<T>, 'load'> => {
	const builder = (ctx: TxCtx<T>): TxBuilder<T> => ({
		load: (load) => builder({...ctx, load}),
		patch: (patch) => builder({...ctx, patch}),
		verify: (verify) => builder({...ctx, verify}),
		saveVersion: (saveVersion) => builder({...ctx, saveVersion}),
		run: ({maxRetries, retryDelay} = {}) => transact({...ctx, maxRetries, retryDelay})
	})

	const notset = (method: string) => (): never => { throw new Error(`${method}() must be set in transaction`)}
	return builder({
		load: notset('load'),
		patch: notset('patch'),
		verify: notset('verify'),
		saveVersion: notset('saveVersion')
	})
}