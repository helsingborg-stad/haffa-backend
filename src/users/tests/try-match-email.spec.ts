import { tryMatchEmail } from '../user-mapper'

describe('tryMatchEmail', () => {
  const TestCases: [string, string, boolean][] = [
    ['john.doe@company.com', '*@*', true],
    ['john.doe@company.com', '*@company.com', true],
    ['john.doe@company.com', '*.doe@company.com', true],
    ['john.doe@company.com', '*.doe@*', true],
    ['john.doe@company.com', '*.smith@company.com', false],
    ['john.doe@company.com', '*@competition.com', false],
    ['john.doe@company.com', 'john.doe@competition.com', false],
    ['john.doe@company.com', 'john.doe@*.com', true],
    ['john.doe@company.com', 'john.doe@company.*', true],
    ['john.doe@company.com', 'john.doe@company', false],
    ['john.doe@company.com', 'john.doe@*.*', true],
    ['john.doe@company.com', 'john.doe@*', true],
  ]

  it.each(TestCases)(
    'tryMatchEmail(%s, %s) => %s',
    (email: string, pattern: string, expectedResult: boolean) =>
      expect(tryMatchEmail(email, pattern)).toBe(expectedResult)
  )
})
