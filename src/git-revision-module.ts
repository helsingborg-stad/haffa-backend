import { readFile } from 'fs/promises'
import { join } from 'path'
import type { ApplicationModule } from './lib/gdi-api-node'

// Small module that exposes contents of 'git_revision.txt' to a response header
export const gitRevisionModule = (): ApplicationModule => {
  const revision = readFile(join(process.cwd(), 'git_revision.txt'), {
    encoding: 'utf8',
  })
    .then(
      text =>
        (text || '')
          .split('\n')
          .map(v => v.trim())
          .filter(v => v)[0] || ''
    )
    .catch(() => '')
  return ({ app }) =>
    app.use(async (ctx, next) => {
      const r = await revision
      ctx.set('x-git-rev', r)
      return next()
    })
}
