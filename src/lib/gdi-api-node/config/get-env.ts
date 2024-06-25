interface GetEnvArgs {
  trim?: boolean
  validate?: (v: string) => boolean
  fallback?: string
}

const notFound = (key: string) => (): string => {
  throw Error(
    `Failed to read and validate environment ${key}="${process.env[key]}"`
  )
}

const tryValidate = (
  key: string,
  value: string,
  validate: (v: string) => boolean
) => {
  try {
    return validate(value)
  } catch {
    throw new Error(
      `Failed to read and validate environment ${key}="${process.env[key]}"`
    )
  }
}

/** get named evironment variable with options for trimming, validation and default value */
export const getEnv = (
  key: string,
  { trim, validate, fallback }: GetEnvArgs = { trim: true }
): string =>
  [process.env[key], fallback]
    .filter(v => typeof v === 'string')
    .map(v => v!)
    .map(v => (trim ? v.trim() : v))
    .filter(v => tryValidate(key, v, validate || (() => true)))
    .map(value => () => value)
    .concat(notFound(key))[0]()
