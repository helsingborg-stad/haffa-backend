export interface LoginPolicy {
	emailPattern: string
	roles: string[]
	deny: boolean
}

export interface Category {
	id: string
	label: string
	categories: Category[]
}

export interface SettingsService {
	isSuperUser: (email: string) => boolean
	getLoginPolicies: () => Promise<LoginPolicy[]>
	updateLoginPolicies: (policies: LoginPolicy[]) => Promise<LoginPolicy[]>
	getCategories: () => Promise<Category[]>
	updateCategories: (categories: Category[]) => Promise<Category[]>
}