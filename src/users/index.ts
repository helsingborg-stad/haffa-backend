import { getEnv } from "@helsingborg-stad/gdi-api-node"
import { createInMemoryUserMapper } from "./in-memory-user-mapper/in-memory-user-mapper"

export {createInMemoryUserMapper}

export const createUserMapperFromEnv = () => {
	const superUser = getEnv('SUPER_USER', {fallback: ''})	
	return createInMemoryUserMapper(superUser)
}