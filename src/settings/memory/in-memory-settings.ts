
import type { Category } from "../../categories/types"
import { normalizeLoginPolicies } from "../normalize-login-policies"
import type { LoginPolicy, SettingsService } from "../types"

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

	let mutLoginPolicies = loginPolicies
	let mutCategories: Category[] = []
	
	return {
		isSuperUser: email => !!superUser && (email === superUser),
		getLoginPolicies: async () => mutLoginPolicies,
		updateLoginPolicies: async (p) => {
			mutLoginPolicies = normalizeLoginPolicies(p)
			return mutLoginPolicies
		},
		getCategories: async () => mutCategories,
		updateCategories: async (categories) => {
			mutCategories = categories
			return mutCategories
		}
	}
}