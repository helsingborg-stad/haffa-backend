import { obfuscate } from '..'

describe('obfuscate', () => {
  it('maps special names such as secret and key', () =>
    expect(
      obfuscate({
        secret_stuff: 'a',
        hidden_key_should_never_show: 'b',
        someValue: 123,
      })
    ).toMatchObject({
      secret_stuff: '--secret--',
      hidden_key_should_never_show: '--secret--',
      someValue: 123,
    }))

  it('detects urls and hides sensitive information', () =>
    expect(
      obfuscate({
        someValue: 'http://u:p@a.com?a_key=123&a_value=123',
      })
    ).toMatchObject({
      someValue:
        'http://--user--:--password--@a.com/?a_key=--secret--&a_value=123',
    }))

  it('handles arrays', () =>
    expect(
      obfuscate({
        someValues: ['abc', 'http://u:p@a.com?a_key=123&a_value=123'],
        secrets: ['a', 'b'],
      })
    ).toMatchObject({
      someValues: [
        'abc',
        'http://--user--:--password--@a.com/?a_key=--secret--&a_value=123',
      ],
      secrets: ['--secret--', '--secret--'],
    }))
})
