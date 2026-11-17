import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

vi.mock('@/config', () => ({
  config: { apiBaseUrl: '', apiKey: 'secret-key', organizationId: 'org-1', userId: 'user-1' },
}))

import { verifyAccess } from '../accounts'
import { fetchContacts, fetchMessages, saveContact } from '../mconnect'

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
  })
}

const expected = { 'x-api-key': 'secret-key', 'x-org-id': 'org-1', 'x-user-id': 'user-1' }

afterEach(() => vi.unstubAllGlobals())

describe('auth headers', () => {
  it('sends the key, organization and user on reads', async () => {
    const fetchSpy = vi.fn<typeof fetch>().mockImplementation(async () => ok([]))
    vi.stubGlobal('fetch', fetchSpy)

    await fetchMessages()

    expect(fetchSpy.mock.calls[0]?.[1]?.headers).toMatchObject(expected)
  })

  it('sends them on contact reads and writes too', async () => {
    const fetchSpy = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => ok({ results: [], pagination: {} }))
    vi.stubGlobal('fetch', fetchSpy)

    await fetchContacts(1)
    await saveContact({} as Parameters<typeof saveContact>[0])

    for (const call of fetchSpy.mock.calls) {
      expect(call[1]?.headers).toMatchObject(expected)
    }
  })
})

describe('verifyAccess', () => {
  const entered = { apiKey: 'typed-key', organizationId: 'typed-org', userId: 'typed-user' }

  it('checks the details that were typed, not the saved ones', async () => {
    const fetchSpy = vi.fn<typeof fetch>().mockImplementation(async () => ok([]))
    vi.stubGlobal('fetch', fetchSpy)

    await expect(verifyAccess(entered)).resolves.toBeUndefined()

    expect(fetchSpy.mock.calls[0]?.[1]?.headers).toEqual({
      'x-api-key': 'typed-key',
      'x-org-id': 'typed-org',
      'x-user-id': 'typed-user',
    })
  })

  it.each([
    [401, /API key was not accepted/],
    [503, /no key configured/],
    [400, /Invalid organization id/],
  ])('explains a %i response', async (status, message) => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockImplementation(async () =>
          Response.json({ statusMessage: 'Invalid organization id.' }, { status }),
        ),
    )

    await expect(verifyAccess(entered)).rejects.toThrow(message)
  })

  it('says so when the API cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed')))

    await expect(verifyAccess(entered)).rejects.toThrow(/Could not reach/)
  })
})