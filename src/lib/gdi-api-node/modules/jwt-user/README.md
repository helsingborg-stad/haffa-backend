# JWT-User module

Updates __ctx.user__ with payload extracted from JWT bearer token, if present in request header.

If JWT bearer token is missing, and `JWT_DEFAULT_USER` is set, the JSON parsing of `JWT_DEFAULT_USER` is used.

```sh
JWT_DEFAULT_USER={id: 0, name: 'Unknown'}
```

## Usage:

```ts
import { createApplication } from 'gdi-api-node'
import jwtUserModule from 'gdi-api-node/modules/jwt-user'
import { createAuthorizationServiceFromEnv } from 'gdi-api-node/services/authorization-service'

createApplication({
		openApiDefinitionPath: 'openapi.yml',
		validateResponse,
	})
	.use(jwtUserModule(createAuthorizationServiceFromEnv()))
```