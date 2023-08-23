import { getEnv } from "@helsingborg-stad/gdi-api-node";
import { createInMemorySettingsService } from "./memory/in-memory-settings";
import type { SettingsService } from "./types";
import { tryCreateFsSettingsServiceFromEnv } from "./fs";

export {createInMemorySettingsService}

export const createSettingsServiceFromEnv = (): SettingsService => 
	tryCreateFsSettingsServiceFromEnv() ||
	createInMemorySettingsService({
		superUser: getEnv('SUPER_USER', {fallback: ''}),
		loginPolicies: []
	})
