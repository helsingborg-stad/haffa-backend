import type { Category } from "./types";


const trimStr = (v: any): string => typeof v === 'string' ? v.trim() : ''

export const normalizeCategories = (categories: Category[]): Category[] => categories
	.map(({id, parentId, label, co2kg}) => ({
		id: trimStr(id),
		parentId: trimStr(parentId),
		label: trimStr(label),
		co2kg: co2kg  || 0
	}))
	.filter(({id}) => id)