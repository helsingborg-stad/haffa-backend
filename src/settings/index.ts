import { getEnv } from "@helsingborg-stad/gdi-api-node";
import { createInMemorySettingsService } from "./memory/in-memory-settings";
import type { SettingsService } from "./types";

export {createInMemorySettingsService}

export const createSettingsServiceFromEnv = (): SettingsService => createInMemorySettingsService({
	superUser: getEnv('SUPER_USER', {fallback: ''}),
	loginPolicies: [{
		emailPattern: '.*@helsingborg.se',
		roles: ['a'],
		deny: false
	}]
})
