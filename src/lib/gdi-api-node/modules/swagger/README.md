# Swagger module

Exposes `/swagger` and `/swagger.json` with contents derived from current openapi specification.

Also redirects `/` to `/swagger`

## Usage:

```ts
import { createApplication } from 'gdi-api-node'
import swaggerModule from 'gdi-api-node/modules/swagger'

createApplication({
		openApiDefinitionPath: 'openapi.yml',
		validateResponse,
	})
	.use(swaggerModule())
```