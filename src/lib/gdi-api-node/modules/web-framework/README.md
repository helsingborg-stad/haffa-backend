# Web framwork module

Module thet handles basic CORS and body parsing for your convenience 🍻

## Usage:

```ts
import { createApplication } from 'gdi-api-node'
import webFrameworkModule from 'gdi-api-node/modules/web-framework'

createApplication({
		openApiDefinitionPath: 'openapi.yml',
		validateResponse,
	})
	.use(webFrameworkModule())
```