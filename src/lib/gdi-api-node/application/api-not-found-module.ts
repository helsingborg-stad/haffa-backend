import { ApplicationContext } from './types'

export const apiNotFoundModule = () => ({ api }: ApplicationContext): void => 
	// setup reasonable defaults
	api.register({
		// https://github.com/anttiviljami/openapi-backend#quick-start
		notFound: (c, ctx) => ctx.throw(404),
	})
