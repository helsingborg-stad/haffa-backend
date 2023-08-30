import type { SettingsService } from "../settings/types"
import type { LoginPolicy } from "./types"

export const loginPolicyAdapter = (settings: SettingsService) => ({
	getLoginPolicies: () => settings.getSetting<LoginPolicy[]>('login-policies')
		.then(normalizeLoginPolicies),
	updateLoginPolicies: (policies: LoginPolicy[]) => settings.updateSetting<LoginPolicy[]>('login-policies', policies)
		.then(normalizeLoginPolicies)
})

const normalizeLoginPolicies = (policies: LoginPolicy[]|null|undefined): LoginPolicy[] => 
	(Array.isArray(policies) ? policies : [])
		.map(({emailPattern, roles, deny }) => ({
			emailPattern: (emailPattern || '').trim().toLowerCase(),
			roles: Array.from(new Set<string>((roles||[]).map(v => (v||'').trim().toLowerCase()))).filter(r => r),
			deny
		}))
		.filter(({emailPattern}) => emailPattern)