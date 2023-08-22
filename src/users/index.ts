import { createUserMapper } from "./user-mapper"
import type { SettingsService } from "../settings/types"

export {createUserMapper}

export const createUserMapperFromEnv = (settings: SettingsService) => createUserMapper(settings)