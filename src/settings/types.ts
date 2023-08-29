export interface LoginPolicy {
	emailPattern: string
	roles: string[]
	deny: boolean
}

export interface Category {
	id: string
	parentId: string
	label: string
}

export interface SettingsService {
	isSuperUser: (email: string) => boolean
	getLoginPolicies: () => Promise<LoginPolicy[]>
	updateLoginPolicies: (policies: LoginPolicy[]) => Promise<LoginPolicy[]>
	getCategories: () => Promise<Category[]>
	updateCategories: (categories: Category[]) => Promise<Category[]>
}