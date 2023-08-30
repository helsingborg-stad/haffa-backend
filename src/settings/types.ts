import type { Category } from "../categories/types"

export interface LoginPolicy {
	emailPattern: string
	roles: string[]
	deny: boolean
}

export interface SettingsService {
	isSuperUser: (email: string) => boolean
	getLoginPolicies: () => Promise<LoginPolicy[]>
	updateLoginPolicies: (policies: LoginPolicy[]) => Promise<LoginPolicy[]>
	getCategories: () => Promise<Category[]>
	updateCategories: (categories: Category[]) => Promise<Category[]>
}