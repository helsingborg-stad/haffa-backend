export interface LoginPolicy {
	emailPattern: string
	roles: string[]
	deny: boolean
}
