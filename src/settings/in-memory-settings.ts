import type { LoginPolicy, SettingsService } from "./types"

interface SettingsServiceProps {
	superUser?: string
	loginPolicies?: LoginPolicy[]
}

const normalizeProps = (props?: SettingsServiceProps): Required<SettingsServiceProps> => {
	const {
		superUser,
		loginPolicies
	} = {
		superUser: '',
		loginPolicies: [],
		...props
	}
	return {
		superUser: superUser.trim().toLocaleLowerCase(),
		loginPolicies
	}
}

export const createInMemorySettingsService = (props?: SettingsServiceProps): SettingsService => {
	const {
		superUser,
		loginPolicies
	} = normalizeProps(props)
	
	return {
		isSuperUser: email => !!superUser && (email === superUser),
		getLoginPolicies: async () => loginPolicies
	}
}