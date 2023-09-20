import { createIssuePincode } from '.'

describe('createIssuePincode', () => {
  it('allows for hardcoded pincode', () => {
    const n = 100
    const issuer = createIssuePincode('123457')
    for (let i = 0; i < n; i += 1) {
      expect(issuer()).toBe('123457')
    }
  })

  it('always creates pincodes starting with 1-9 followed by 5 digits 0-9', () => {
    const n = 10000
    const issuer = createIssuePincode()
    for (let i = 0; i < n; i += 1) {
      expect(issuer()).toMatch(/^[1-9][0-9]{5}$/)
    }
  })

  it('has a nice distribution of digits 0-9', () => {
    const n = 10000
    const issuer = createIssuePincode()

    const freq = {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      '7': 0,
      '8': 0,
      '9': 0,
    } as Record<string, number>
    for (let i = 0; i < n; i += 1) {
      issuer()
        .split('')
        // eslint-disable-next-line no-return-assign
        .forEach(char => {
          freq[char] += 1
        })
    }

    expect(Object.keys(freq).sort()).toMatchObject('0123456789'.split(''))

    '0123456789'.split('').forEach(char => {
      expect(freq[char]).toBeGreaterThan(1)
    })
  })
})
