import type { LoginPolicy } from "./types"

export const normalizeLoginPolicies = (policies: LoginPolicy[]): LoginPolicy[] => 
	(policies || [])
		.map(({emailPattern, roles, deny }) => ({
			emailPattern: (emailPattern || '').trim().toLowerCase(),
			roles: Array.from(new Set<string>((roles||[]).map(v => (v||'').trim().toLowerCase()))).filter(r => r),
			deny
		}))
		.filter(({emailPattern}) => emailPattern)