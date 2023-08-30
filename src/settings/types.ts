export interface SettingsService {
	getSetting: <T>(name: string) => Promise<T|null>,
	updateSetting: <T>(name: string, value: T) => Promise<T|null>
}