import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

vi.mock('@/config', () => ({
  config: { apiBaseUrl: '', apiKey: 'secret-key', organizationId: 'org-1', userId: '' },
}))

import { fetchContacts, fetchMessages, saveContact } from '../mconnect'

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
  })
}

afterEach(() => vi.unstubAllGlobals())

describe('x-api-key', () => {
  it('is sent on reads, alongside the org id where one is needed', async () => {
    const fetchSpy = vi.fn<typeof fetch>().mockImplementation(async () => ok([]))
    vi.stubGlobal('fetch', fetchSpy)

    await fetchMessages()

    expect(fetchSpy.mock.calls[0]?.[1]?.headers).toMatchObject({
      'x-api-key': 'secret-key',
      'x-org-id': 'org-1',
    })
  })

  it('is sent on contact reads and writes', async () => {
    const fetchSpy = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => ok({ results: [], pagination: {} }))
    vi.stubGlobal('fetch', fetchSpy)

    await fetchContacts(1)
    await saveContact({} as Parameters<typeof saveContact>[0])

    for (const call of fetchSpy.mock.calls) {
      expect(call[1]?.headers).toMatchObject({ 'x-api-key': 'secret-key' })
    }
  })
})