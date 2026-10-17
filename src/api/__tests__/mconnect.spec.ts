import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { ApiError, fetchContacts, fetchMessages, renderPreview, saveContact } from '../mconnect'

function respond(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    ...init,
  })
}

afterEach(() => vi.unstubAllGlobals())

describe('fetchMessages', () => {
  it('refuses to call the API without an organization id', async () => {
    const fetchSpy = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchSpy)

    await expect(fetchMessages()).rejects.toThrow(/VITE_DEFAULT_ORGANIZATION_ID/)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('fetchContacts', () => {
  it('unwraps the paginated result list', async () => {
    const fetchSpy = vi
      .fn<typeof fetch>()
      .mockResolvedValue(respond({ results: [{ id: 'c1' }], pagination: {} }))
    vi.stubGlobal('fetch', fetchSpy)

    await expect(fetchContacts(10)).resolves.toEqual([{ id: 'c1' }])
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('/api/contacts?limit=10')
  })

  it('surfaces the server message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(respond({ statusMessage: 'Boom' }, { status: 500 })),
    )

    await expect(fetchContacts()).rejects.toMatchObject({ message: 'Boom', status: 500 })
  })
})

describe('saveContact', () => {
  it('PUTs the contact as JSON', async () => {
    const fetchSpy = vi
      .fn<typeof fetch>()
      .mockResolvedValue(respond({ contactId: 'c9', status: 'created' }))
    vi.stubGlobal('fetch', fetchSpy)

    const input = { brand: 'Lotus', company: 'Lotus', address: 'Pune', pocPerson: 'Anita' }
    await expect(saveContact(input)).resolves.toEqual({ contactId: 'c9', status: 'created' })

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body as string)).toEqual(input)
  })
})

describe('renderPreview', () => {
  it('accepts a raw HTML response', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response('<p>hi</p>', { headers: { 'content-type': 'text/html' } })),
    )

    await expect(renderPreview({ templateId: 't', variables: {} })).resolves.toEqual({
      contentHtml: '<p>hi</p>',
    })
  })

  it('throws an ApiError for error payloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(respond({ error: { message: 'bad vars' } }, { status: 422 })),
    )

    const error = await renderPreview({ templateId: 't', variables: {} }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ message: 'bad vars', status: 422 })
  })
})