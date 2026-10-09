import { defineConfig } from 'vitest/config'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const graphql = require.resolve('graphql')

export default defineConfig({
    test: {
        include: [
            './src/**/*.{test,spec}.ts(x)?',
        ],
    },
    resolve: {
        alias: {
            graphql,
        },
    }
})