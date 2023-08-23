import { getEnv } from "@helsingborg-stad/gdi-api-node";
import { join } from "path";
import type { SettingsService } from "../types";
import { createFsSettingsService } from "./fs-settings-service";

export const tryCreateFsSettingsServiceFromEnv = (): SettingsService|null => {
  const folder = getEnv('FS_DATA_PATH', { fallback: '' })
  const superUser = getEnv('SUPER_USER', { fallback: '' })
  return folder
    ? createFsSettingsService(superUser.toLowerCase(), join(process.cwd(), folder, 'settings'))
    : null
}