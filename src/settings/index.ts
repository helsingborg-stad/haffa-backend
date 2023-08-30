import { createInMemorySettingsService } from "./memory/in-memory-settings";
import type { SettingsService } from "./types";
import { tryCreateFsSettingsServiceFromEnv } from "./fs";
import { tryCreateMongoDbSettingsServiceFromEnv } from "./mongodb";

export {createInMemorySettingsService}

export const createSettingsServiceFromEnv = (): SettingsService => 
	tryCreateMongoDbSettingsServiceFromEnv()
	|| tryCreateFsSettingsServiceFromEnv()
	|| createInMemorySettingsService()
