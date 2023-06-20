import rules from './rules.json'

type Role = 'Administratör' | 'Kommun' | 'Företag'

interface IRule {
	pattern: string;
	roles: string[];
}
interface IUser {
	isAuthorized: boolean;
	hasRole: (roleName: Role) => boolean
}
const User = (emailAddress: string, list: IRule[] = rules): IUser => {	
	const rule = list.find(rule => new RegExp(rule.pattern).test(emailAddress))

	return {
		isAuthorized: Boolean(rule),
		hasRole: (roleName) => rule?.roles.includes(roleName),
	}
}
export { User }