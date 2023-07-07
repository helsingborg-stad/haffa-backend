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

export interface TxValidateContext<T> {
	data: T,
	throwIf: (condition: boolean, error: TxError) => void
}

export interface TxLoadContext<T> {
	throwIf: (condition: boolean, error: TxError) => void
}
export interface TxCtx<T> {
	maxRetries?: number, retryDelay?: number,
	load: (ctx: TxLoadContext<T>) => Promise<T|null>|T|null,
	validate: (data: T, ctx: TxValidateContext<T>) => Promise<void>|void
	patch: (data: T, ctx: TxPatchContext<T>) => Promise<T|null>|T|null,
	verify: (data: T, ctx: TxVerifyContext<T>) => Promise<T|null>|T|null
	saveVersion: (versionId: string, data: T) =>  Promise<T|null>|T|null,
}

export const TxErrors: Record<string, TxError> = {
	NotFound: {
		code: 'EHAFFA_NOT_FOUND',
		message: 'Resursen kunde inte hittas.'
	},
	Unauthorized: {
		code: 'EHAFFA_UNAUTHORIZED',
		message: 'Du saknar behörighet för åtgärden'
	}
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
	{ load, validate, patch, verify, saveVersion }: TxCtx<T>
): Promise<Omit<TxResult<T>,'attempts'> & {
	shouldRetry?: boolean, 
	commitActions?: TxCommitAction<T>[],
	original: T,
	}| null> => {

	let errorResult: T|null = null
	try {
		const commitActions: TxCommitAction<T>[] = []
		const original = await load({throwIf})
		if (!original) {
			return null
		}
		errorResult = original

		await validate(original, {data: original, throwIf})

		const update = await patch(original, {
			data: original, 
			actions: action => commitActions.push(action),
			throwIf
		})
		if (!update) {
			return null
		}

	
		const verified = await verify(update, {
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
				original: errorResult!,
				data: errorResult!,
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
	load: (load: TxCtx<T>['load']) => Pick<TxBuilder<T>, 'validate'>,
	validate: (validate: TxCtx<T>['validate']) => Pick<TxBuilder<T>, 'patch'>,
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
		validate: (validate) => builder({...ctx, validate}),
		patch: (patch) => builder({...ctx, patch}),
		verify: (verify) => builder({...ctx, verify}),
		saveVersion: (saveVersion) => builder({...ctx, saveVersion}),
		run: ({maxRetries, retryDelay} = {}) => transact({...ctx, maxRetries, retryDelay})
	})

	const notset = (method: string) => (): never => { throw new Error(`${method}() must be set in transaction`)}
	return builder({
		load: notset('load'),
		validate: notset('validate'),
		patch: notset('patch'),
		verify: notset('verify'),
		saveVersion: notset('saveVersion')
	})
}