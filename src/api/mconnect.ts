import { config } from '@/config'
import type {
  Contact,
  ContactInput,
  ContactSaveResult,
  ContactsResponse,
  EmailMessage,
  EmailTelemetry,
  SendEmailInput,
  SendEmailResult,
} from '@/api/types'
import type {
  PreviewRequestPayload,
  PreviewResponse,
  TemplateListItem,
  TemplateSchema,
} from '@/types/email'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function url(path: string): string {
  return `${config.apiBaseUrl.replace(/\/$/, '')}/api${path}`
}

/** Who is calling: the API needs the key, the organization and the acting user on every request. */
export interface Access {
  apiKey: string
  organizationId: string
  userId: string
}

export function authHeaders(access: Access = config): Record<string, string> {
  if (!access.apiKey || !access.organizationId || !access.userId) {
    throw new ApiError('Add your organization ID, user ID and API key in Setup first.', 400)
  }
  return {
    'x-api-key': access.apiKey,
    'x-org-id': access.organizationId,
    'x-user-id': access.userId,
  }
}

async function failure(res: Response, fallback: string): Promise<ApiError> {
  let detail = ''
  try {
    const body = (await res.json()) as { message?: string; statusMessage?: string }
    detail = body.message || body.statusMessage || ''
  } catch {
    // Non-JSON error body; the status line is all there is.
  }
  return new ApiError(detail || `${fallback} (${res.status})`, res.status)
}

async function getJson<T>(path: string, fallback: string): Promise<T> {
  const res = await fetch(url(path), { headers: authHeaders() })
  if (!res.ok) throw await failure(res, fallback)
  return res.json() as Promise<T>
}

export function fetchTemplateList(): Promise<TemplateListItem[]> {
  return getJson('/interaction/email/template', 'Failed to load templates')
}

export function fetchTemplateSchema(id: string): Promise<TemplateSchema> {
  return getJson(
    `/interaction/email/template/${encodeURIComponent(id)}`,
    'Failed to load template schema',
  )
}

export async function renderPreview(
  payload: PreviewRequestPayload,
  signal?: AbortSignal,
): Promise<PreviewResponse> {
  const res = await fetch(url('/interaction/email/template/preview'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
    throw new ApiError(message, res.status)
  }

  return { contentHtml: data.contentHtml ?? '' }
}

export async function fetchMessages(): Promise<EmailMessage[]> {
  return getJson('/interaction', 'Failed to load the inbox')
}

export function fetchTelemetry(emailId: string): Promise<EmailTelemetry> {
  return getJson(
    `/interaction/email/${encodeURIComponent(emailId)}/telemetry`,
    'Failed to load email activity',
  )
}

export async function fetchContacts(limit = 200): Promise<Contact[]> {
  const data = await getJson<ContactsResponse>(`/contacts?limit=${limit}`, 'Failed to load clients')
  return data.results
}

export async function saveContact(input: ContactInput): Promise<ContactSaveResult> {
  const res = await fetch(url('/contacts'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw await failure(res, 'Failed to save the client')
  return res.json()
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const res = await fetch(url('/interaction/email/send'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw await failure(res, 'Failed to send the email')
  return res.json()
}