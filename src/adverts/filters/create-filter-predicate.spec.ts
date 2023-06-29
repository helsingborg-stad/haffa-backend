import { createFilterPredicate } from './create-filter-predicate'

const range = (n: number): number[] => [...Array(n).keys()]

describe('createFilterPredicate', () => {

	const data = range(100)
		.map(i => ({
			id: i,
			title: `title ${i}`,
			description: `description ${i}`,
			idx2: i*2,
		}))

	const filteredData = (filter: any): any[] => data.filter(createFilterPredicate(filter))
	
	const testData = (filter: any, expected: any) => expect(filteredData(filter))
		.toMatchObject(expected)

	it('eq', () => {
		testData({
			title: { eq: 'title 3' },
		}, [data[3]])

		testData({
			id: { eq: 3 },
		},[data[3]])

		testData({
			id: { eq: 3 },
			idx2: { eq: 6 },
		}, [data[3]])
	})	
	it('ne', () => {
		testData({
			title: { ne: 'title 3' },
		}, data.filter(({ id }) => id !== 3))
	})	
	it('gt', () => {
		testData({
			id: { gt: 50 },
		},data.filter(({ id }) => id > 50))
	})	
	it('gte', () => {
		testData({
			id: { gte: 50 },
		}, data.filter(({ id }) => id >= 50))
	})	
	it('lt', () => {
		testData({
			id: { lt: 50 },
		}, data.filter(({ id }) => id < 50))
	})	
	it('lte', () => {
		testData({
			id: { lte: 50 },
		}, data.filter(({ id }) => id <= 50))
	})	
	it('contains', () => {
		testData({
			description: { contains: 'ion 5' },
		},[
			data[5],
			...data.slice(50, 60) ])
	})

	it('not', () => {
		testData({
			not: {
				id: { lte: 50 },
			},
		}, data.filter(({ id }) => id > 50))

		testData({
			not: {
				title: { eq: 'missing' },
			},
		},data)
	})

	it('and', () => {
		testData({
			and: [
				{ id: { gt: 50 } },
				{ idx2: { eq: 98 * 2 } }, 
			],
		}, data.filter(({ id }) => id === 98))

		testData({
			and: [
				{ id: { gt: 50 } },
				{ title: { eq: 'missing' } }, 
			],
		}, [])
	})

	it('or', () => {
		testData({
			or: [
				{ id: { eq: 10 } },
				{ idx2: { eq: 20 * 2 } }, 
				{ title: { eq: 'title 30' } }, 
				{ description: { eq: 'missing' } },
				{ randomField: { eq: '?' } },
			],
		}, [ data[10], data[20], data[30] ])

		testData({
			and: [
				{ id: { gt: 50 } },
				{ title: { eq: 'missing' } }, 
			],
		}, [])
	})

	it('and, or, not', () => {
		testData({
			and: [
				{ not: { id: { gt: 41 } } },
				{
					or: [
						{ id: { gte: 40 } },
					],
				},
			],
		},
		[ data[40], data[41] ])
	})
})