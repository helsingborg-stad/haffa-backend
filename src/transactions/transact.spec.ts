import * as uuid from 'uuid'
import { transact, txBuilder } from '.'

const versionedDatase = <T extends { versionId: string }>(
  db: Record<string, T> = {}
) => ({
  peek: () => db,
  load: async (id: string) => db[id] || null,
  saveVersion: async (id: string, versionId: string, data: T) => {
    const current = db[id]
    if (!current || current.versionId === versionId) {
      db[id] = data
      return db[id]
    }
    return null
  },
})

interface TestData {
  id: string
  versionId: string
  value: any
}

const uid = () => uuid.v4()

const createTestData = (d?: Partial<TestData>): TestData => ({
  id: uid(),
  versionId: uid(),
  value: null,
  ...d,
})

describe('transact', () => {
  it('create new data entry', async () => {
    const db = versionedDatase<TestData>()

    const newEntry: any = createTestData({})
    const { data, error } =
      (await txBuilder<TestData>()
        .load(() => newEntry)
        .validate(() => {})
        .patch(data => ({
          ...data,
          value: 'new value',
        }))
        .verify(update => update)
        .saveVersion((versionId, d) => db.saveVersion(d.id, versionId, d))
        .run()) || {}

    expect(error).toBeNull()
    expect(data).toMatchObject({ value: 'new value' })
    expect(data).toBe(db.peek()[data!.id])
  })

  it('will run actions on success', async () => {
    const db = versionedDatase<TestData>()
    const action = jest.fn(() => Promise.resolve())
    const newEntry: any = createTestData({})
    const { data, error } =
      (await txBuilder<TestData>()
        .load(() => newEntry)
        .validate(() => {})
        .patch((data, { actions }) => {
          actions(action)
          return {
            ...data,
            value: 'new value',
          }
        })
        .verify(update => update)
        .saveVersion((versionId, d) => db.saveVersion(d.id, versionId, d))
        .run()) || {}

    expect(error).toBeNull()
    expect(data).toMatchObject({ value: 'new value' })
    expect(data).toBe(db.peek()[data!.id])
    expect(action).toHaveBeenCalled()
  })

  it('will retry n times', async () => {
    const db = versionedDatase<TestData>()

    let retries = 5
    const action = jest.fn(() => Promise.resolve())
    const newEntry: any = createTestData({})
    const { data, error, attempts } =
      (await txBuilder<TestData>()
        .load(() => newEntry)
        .validate(() => {})
        .patch((data, { actions }) => {
          actions(action)
          return {
            ...data,
            value: 'new value',
          }
        })
        .verify(update => update)
        .saveVersion((versionId, d) =>
          --retries === 0 ? db.saveVersion(d.id, versionId, d) : null
        )
        .run({ maxRetries: retries })) || {}

    expect(error).toBeNull()
    expect(attempts).toBe(5)
    expect(data).toMatchObject({ value: 'new value' })
    expect(data).toBe(db.peek()[data!.id])
    expect(action).toHaveBeenCalledTimes(1)
  })

  it('will fail after n', async () => {
    const retries = 5
    const saveVersion = jest.fn(() => Promise.resolve(null))
    const newEntry: any = createTestData({})
    const { error, attempts } =
      (await txBuilder<TestData>()
        .load(() => newEntry)
        .validate(() => {})
        .patch(data => ({
          ...data,
          value: 'new value',
        }))
        .verify(update => update)
        .saveVersion(saveVersion)
        .run({ maxRetries: retries })) || {}

    expect(error).toMatchObject({ code: 'HAFFA_ERROR_CONFLICT' })
    expect(attempts).toBe(retries)
  })
})
