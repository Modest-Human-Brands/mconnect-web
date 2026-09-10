import type {
  TemplateListItem,
  TemplateSchema,
  PreviewRequestPayload,
  PreviewResponse,
} from '../types/email'

const BASE_URL = import.meta.env.VITE_MCONNECT_API_URL || ''

export async function fetchTemplateList(): Promise<TemplateListItem[]> {
  const res = await fetch(`${BASE_URL}/api/interaction/email/template`)
  if (!res.ok) throw new Error(`Failed to load templates (${res.status})`)
  return res.json()
}

export async function fetchTemplateSchema(id: string): Promise<TemplateSchema> {
  const res = await fetch(`${BASE_URL}/api/interaction/email/template/${id}`)
  if (!res.ok) throw new Error(`Failed to load template schema (${res.status})`)
  return res.json()
}

export async function renderPreview(
  payload: PreviewRequestPayload,
  signal?: AbortSignal,
): Promise<PreviewResponse> {
  const res = await fetch(`${BASE_URL}/api/interaction/email/template/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  const contentType = res.headers.get('content-type') || ''
  const data: { contentHtml?: string; error?: string | { message: string } } = contentType.includes(
    'application/json',
  )
    ? await res.json()
    : { contentHtml: await res.text() }

  if (!res.ok || data.error) {
    const message =
      (typeof data.error === 'object' ? data.error?.message : data.error) ||
      res.statusText ||
      `Preview request failed (${res.status})`
    throw new Error(message)
  }

  return { contentHtml: data.contentHtml ?? '' }
}