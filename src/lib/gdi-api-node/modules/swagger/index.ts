import { koaSwagger } from 'koa2-swagger-ui'
import { ApplicationModule, ApplicationContext } from '../../application/types'

export interface SwaggerModuleProps {
	routePrefix: string,
}
/**
 * Module that exposes __/swagger__ and __/swagger.json__ with contents derived from current openapi specification
 */
export const swaggerModule = ({ routePrefix }: SwaggerModuleProps = { routePrefix: '/swagger' }): ApplicationModule => ({ app, router, api }: ApplicationContext) => {
	const jsonPath = `${routePrefix}.json`
	app.use(koaSwagger({
		routePrefix: routePrefix,
		swaggerOptions: {
			url: jsonPath,
		},
	}))

	router
		.get(jsonPath, ctx => {
			ctx.body = api.document
		})
		.get('/', ctx => ctx.redirect(routePrefix))
}
