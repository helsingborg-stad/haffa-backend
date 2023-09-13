import { tryConvertDataUriToImageBuffer } from '.'

describe('tryConvertDataUriToImageBuffer', () => {
  it('"" => null', async () =>
    expect(await tryConvertDataUriToImageBuffer('')).toBeNull())
  it('null => null', async () =>
    expect(await tryConvertDataUriToImageBuffer(null!)).toBeNull())

  it('<not a good image> => null', async () => {
    expect(
      await tryConvertDataUriToImageBuffer(
        'data:application/x-test-type;base64,aGVsbG8gd29ybGQK'
      )
    ).toBeNull()
  })
})
