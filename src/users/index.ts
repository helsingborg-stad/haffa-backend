import { getEnv } from "@helsingborg-stad/gdi-api-node"
import { createUserMapper } from "./user-mapper"
import type { SettingsService } from "../settings/types"

export {createUserMapper}

export const createUserMapperFromEnv = (settings: SettingsService) => createUserMapper(
	getEnv('SUPER_USER', {fallback: ''}),
	settings)