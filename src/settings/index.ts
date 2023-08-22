import { getEnv } from "@helsingborg-stad/gdi-api-node";
import { createInMemorySettingsService } from "./in-memory-settings";
import type { SettingsService } from "./types";

export const createSettingsServiceFromEnv = (): SettingsService => createInMemorySettingsService({
	superUser: getEnv('SUPER_USER', {fallback: ''})
})