import { readFile, writeFile } from 'fs/promises'
import { mkdirp } from 'mkdirp'
import { join } from 'path';
import type { SettingsService } from "../types";

export const createFsSettingsService = (folder: string): SettingsService => {
	const settingPath = (name: string) => join(folder, `${name}.json`)
	const getSetting: SettingsService['getSetting'] = <T>(name: string): Promise<T|null> => readFile(settingPath(name), { encoding: 'utf8' })
		.then(text => JSON.parse(text))
		.catch(() => null)

	const updateSetting: SettingsService['updateSetting'] = <T>(name: string, value: T): Promise<T|null> => mkdirp(folder)
		.then(() => writeFile(settingPath(name), JSON.stringify(value, null, 2), { encoding: 'utf8' }))
		.then(() => getSetting<T>(name))


	return {
		getSetting,
		updateSetting
	}
}