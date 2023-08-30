export const loginPoliciesGqlSchema = /* GraphQL */`

type Query {
	loginPolicies: [LoginPolicy]
	categories: [Category]
}

type Mutation {
	updateLoginPolicies(input: [LoginPolicyInput]!): [LoginPolicy]
	updateCategories(input: [CategoryInput]!): [Category]
}

type LoginPolicy {
	emailPattern: String
	roles: [String]
	deny: Boolean
}

input LoginPolicyInput {
	emailPattern: String
	roles: [String]
	deny: Boolean
}
`