import { EntityResolverMap } from '@helsingborg-stad/gdi-api-node/graphql'

export const termsResolver = (): EntityResolverMap => ({
	Query: {
		terms: () => ({
			unit: [ 'st', 'm', 'dm', 'cm', 'mm', 'm²', 'dm²', 'cm²', 'mm²', 'm³', 'dm³', 'cm³', 'mm³', 'l', 'kg', 'hg', 'g', 'mg' ],
			material: [ 'Trä', 'Plast', 'Metall', 'Textil', 'Annat' ],
			condition: [ 'Nyskick', 'Bra', 'Sliten' ],
			usage: [ 'Inomhus', 'Utomhus' ],
		}),
	},
})