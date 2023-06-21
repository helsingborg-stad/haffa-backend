import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { AccessRule, AccessService } from './types'
import { readFileSync } from 'fs'

const createAccessServiceFromEnv = (): AccessService => {
	const path = getEnv('FS_ACCESS_FILE', { fallback: './default.json' })

	let json = []
	try {
		json =  JSON.parse(readFileSync(path).toString())
	} catch(ex) {
		console.error('File %s not found', path)
	}
	return createAccessService(json)
}

const getRuleForUser = (accessList: AccessRule[], emailAddress: string): AccessRule | undefined => {
	return accessList.find(rule => new RegExp(rule.pattern).test(emailAddress))
}

const createAccessService = (accessList: AccessRule[] = []): AccessService => ({
	isAuthorized: (emailAddress: string) => Boolean(getRuleForUser(accessList, emailAddress)),
	hasRole: (emailAddress: string, roleName: string) =>  getRuleForUser(accessList, emailAddress)?.roles.includes(roleName),
})

export { createAccessServiceFromEnv, createAccessService }