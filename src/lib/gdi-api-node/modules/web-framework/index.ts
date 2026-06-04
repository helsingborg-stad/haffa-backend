import cors from '@koa/cors'
import bodyparser from 'koa-bodyparser'
import type {
  ApplicationContext,
  ApplicationModule,
} from '../../application/types'

/** Module thet handles basic CORS and body parsing for your convenience 🍻 */
export const webFrameworkModule =
  (): ApplicationModule =>
  ({ app }: ApplicationContext) =>
    app.use(cors()).use(bodyparser())
