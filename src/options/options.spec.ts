import { optionsAdapter } from '.'
import { createInMemorySettingsService } from '../settings'

const createOptionServiceForTest = () =>
  optionsAdapter(
    createInMemorySettingsService({
      'options-corrupt-values': [
        {
          // No key
          value: `value1`,
        },
        {
          // Key as null
          key: null,
          value: `value1`,
        },
        {
          // Undefined key
          key: undefined,
          value: `value1`,
        },
        {
          // key as object
          key: {},
          value: `value1`,
        },
        {
          // Whitespace in key
          key: ' key1 ',
          value: `value1`,
        },
        {
          // No value
          key: 'key1',
        },
        {
          // value as null
          key: 'key1',
          value: null,
        },
        {
          // undefined value
          key: 'key1',
          value: undefined,
        },
        {
          // Value as object
          key: 'key1',
          value: {},
        },
        {
          // Value as number
          key: 'key1',
          value: 10,
        },
        {
          // Correct value
          key: 'key1',
          value: 'value1',
        },
      ],
    })
  )

describe('createOptionService', () => {
  it('should normalize corrupt values (get)', async () => {
    const service = createOptionServiceForTest()

    const options = await service.getOptions('corrupt-values')

    expect(options).toStrictEqual([
      {
        key: 'key1',
        value: 'value1',
      },
      {
        key: 'key1',
        value: '',
      },
      {
        key: 'key1',
        value: '',
      },
      {
        key: 'key1',
        value: '10',
      },
      {
        key: 'key1',
        value: 'value1',
      },
    ])
  })
  it('should normalize corrupt values (update)', async () => {
    const service = createOptionServiceForTest()

    const options = await service.updateOptions('corrupt-values', [
      {
        key: ' key1 ',
        value: 'value1',
      },
    ])
    expect(options).toStrictEqual([
      {
        key: 'key1',
        value: 'value1',
      },
    ])
  })
})
