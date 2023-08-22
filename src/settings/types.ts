export interface LoginPolicy {
	emailPattern: string
	roles: string[]
	deny: boolean
}

export interface SettingsService {
	isSuperUser: (email: string) => boolean
	getLoginPolicies: () => Promise<LoginPolicy[]>
}