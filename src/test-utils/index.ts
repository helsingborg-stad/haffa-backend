export * from './test-app'
export * from './e2e'

export const T = <T>(comment: string, inner: () => T) => inner()
