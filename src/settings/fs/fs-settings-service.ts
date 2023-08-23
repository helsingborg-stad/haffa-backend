import { readFile, writeFile, unlink } from 'fs/promises'
import { mkdirp } from 'mkdirp'
import { join } from 'path';
import type { LoginPolicy, SettingsService } from "../types";
import { normalizeLoginPolicies } from '../normalize-login-policies';

export const createFsSettingsService = (superUser: string, folder: string): SettingsService => {
	const settingPath = (name: string) => join(folder, name)
	const readSetting = <T>(name: string): Promise<T|null> => readFile(settingPath(name), { encoding: 'utf8' })
		.then(text => JSON.parse(text))
		.catch(() => null)

	const writeSetting = <T>(name: string, value: T): Promise<T|null> => mkdirp(folder)
		.then(() => writeFile(settingPath(name), JSON.stringify(value, null, 2), { encoding: 'utf8' }))
		.then(() => readSetting<T>(name))

	const getLoginPolicies: SettingsService['getLoginPolicies'] = () => readSetting<LoginPolicy[]>('login-policies.json')
		.then(normalizeLoginPolicies)

	const updateLoginPolicies: SettingsService['updateLoginPolicies'] = policies => writeSetting('login-policies.json', policies)
		.then(normalizeLoginPolicies)

	return {
		isSuperUser: email => !!superUser && (email === superUser),
		getLoginPolicies,
		updateLoginPolicies
	}
}