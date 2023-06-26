const isNullOrUndefined = (v: any) => (v === null) || (typeof v === undefined)
const isString = (v: any) => typeof v === 'string'
const isObject = (v: any) => typeof v === 'object'

interface Predicate<T> {
	(value: T): boolean
}
const operators: Record<string, (string: any, value: any) => (obj: any) => boolean> = {
	eq: (field, v) => o => (o[field] === v),
	ne: (field, v) => o => (o[field] !== v),
	gt: (field, v) => o => (o[field] > v),
	gte: (field, v) => o => (o[field] >= v),
	lt: (field, v) => o => (o[field] < v),
	lte: (field, v) => o => (o[field] <= v),
	contains: (field, v) => o => (isString(o[field]) && isString(v) && o[field].includes(v)),
}

const createAndPredicate = <T>(input: any): Predicate<T>|null => {
	if (!Array.isArray(input)) {
		return null
	}
	const predicates = input.map(inner => createFilterPredicate(inner)).filter(p => p)
	return (value) => predicates.every(p => p(value))
}

const createOrPredicate = <T>(input: any): Predicate<T>|null => {
	if (!Array.isArray(input)) {
		return null
	}
	const predicates = input.map(createFilterPredicate).filter(p => p)
	return (value) => predicates.some(p => p(value))
}

const createNotPredicate = <T>(input: any): Predicate<T>|null => {
	if (!isObject(input)) {
		return null
	}
	const inner = createFilterPredicate(input)
	return (value) => !inner(value)
}


export const createFilterPredicate = <T>(input: any): Predicate<T> => {
	if (!input) {
		return () => true
	}
	
	const predicates: (Predicate<T>|null)[] = Object
		.entries(input)
		.filter(([ field, fieldPredicate ]) => isString(field) && isObject(fieldPredicate))
		.map(([ field, fieldPredicate ]) => 
			field === 'and' 
				? [createAndPredicate<T>(fieldPredicate)]
				: field === 'or'
					? [createOrPredicate<T>(fieldPredicate)]
					: field === 'not'
						? [createNotPredicate<T>(fieldPredicate)]
						: Object
							.entries(fieldPredicate)
							.filter(([ operator, value ]) => !(isNullOrUndefined(operator) || isNullOrUndefined(value)) )
							.map(([ operator, value ]) => operators[operator]?.(field, value))	
		)
		.reduce((l, predicates) => [ ...l, ...predicates ], [])
		.filter(p => p)

	return (subject) => predicates.every(p => p(subject))
}