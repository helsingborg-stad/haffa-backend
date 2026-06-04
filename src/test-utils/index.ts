export * from './e2e'
export * from './test-app'

export const T = <T>(comment: string, inner: () => T) => inner()
