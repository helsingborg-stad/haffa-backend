import type { Filter } from "mongodb"
import type { MongoAdvert } from "../types"

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
export const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

// Combine many filters with logical and handling edge cases of 0, 1 or many
export const combineAnd = (
	queries: (Filter<MongoAdvert> | null | undefined)[]
): Filter<MongoAdvert> | null => {
	const [first, second, ...tail] = queries.filter(v => v)
	return first && second
		? { $and: [first, second, ...(tail as Filter<MongoAdvert>[])] }
		: first || null
}
