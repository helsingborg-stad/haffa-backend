import type { SettingsService } from "../types"

export const createInMemorySettingsService = (db?: Record<string, any>): SettingsService => {
	const effectiveDb = db || {}
	const getSetting: SettingsService['getSetting'] = async <T>(name: string) => (effectiveDb[name] || null) as T
	const updateSetting: SettingsService['updateSetting'] = async (name, value) => {
		effectiveDb[name] = value
		return getSetting(name)
	}
	return {
		getSetting,
		updateSetting
	}
}