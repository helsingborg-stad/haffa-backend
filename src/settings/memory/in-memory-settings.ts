import type { SettingsService } from "../types"

interface SettingsServiceProps {
	superUser?: string
	db?: any
}

const normalizeProps = (props?: SettingsServiceProps): Required<SettingsServiceProps> => {
	const {
		superUser,
		db
	} = {
		superUser: '',
		db: {},
		...props
	}
	return {
		superUser: superUser.trim().toLocaleLowerCase(),
		db: db || {}
	}
}

export const createInMemorySettingsService = (props?: SettingsServiceProps): SettingsService => {
	const {
		superUser,
		db
	} = normalizeProps(props)

	const getSetting: SettingsService['getSetting'] = async <T>(name: string) => (db[name] || null) as T

	const updateSetting: SettingsService['updateSetting'] = async (name, value) => {
		db[name] = value
		return getSetting(name)
	}

	return {
		isSuperUser: email => !!superUser && (email === superUser),
		getSetting,
		updateSetting
	}
}