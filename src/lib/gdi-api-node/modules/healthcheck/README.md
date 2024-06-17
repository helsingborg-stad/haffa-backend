# Healthcheck module

Module for the `healthCheck` operation

## Usage:

```ts
import { createApplication } from 'gdi-api-node'
import healthCheckModule from 'gdi-api-node/modules/healthcheck'

createApplication({
		openApiDefinitionPath: 'openapi.yml',
		validateResponse,
	})
	.use(healthCheckModule)
```