import { ApiError, authHeaders, type Access } from '@/api/mconnect'
import { config } from '@/config'

export type EmailProvider = 'google' | 'microsoft' | 'imap'

export interface EmailAccount {
  id: string
  provider: EmailProvider
  /** Mailbox address, e.g. contact@company.com. */
  address: string
  status: 'connected' | 'error'
  detail?: string
}

export interface ImapAccountInput {
  fromName: string
  fromEmail: string
  imapHost: string
  imapPort: number
  smtpHost: string
  smtpPort: number
  user: string
  pass: string
}

function request(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${config.apiBaseUrl.replace(/\/$/, '')}/api/email/accounts${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  })
}

async function ok<T>(res: Response, fallback: string): Promise<T> {
  if (res.ok) return (res.status === 204 ? undefined : await res.json()) as T
  let detail = ''
  try {
    const body = (await res.json()) as { message?: string; statusMessage?: string }
    detail = body.message || body.statusMessage || ''
  } catch {
    // Non-JSON error body.
  }
  throw new ApiError(detail || `${fallback} (${res.status})`, res.status)
}

/**
 * Checks a key and organization against the API before they are saved. Uses the values passed in,
 * not the saved config, and fails with a message fit to show under the form.
 */
export async function verifyAccess(access: Access) {
  const headers = authHeaders(access)
  let res: Response
  try {
    res = await fetch(`${config.apiBaseUrl.replace(/\/$/, '')}/api/email/accounts`, { headers })
  } catch {
    throw new ApiError('Could not reach the MConnect API. Check your connection and try again.', 0)
  }
  if (res.ok) return
  if (res.status === 401) throw new ApiError('That API key was not accepted.', 401)
  if (res.status === 503) throw new ApiError('The API has no key configured yet.', 503)
  await ok(res, 'Could not verify these details')
}

export async function listAccounts(): Promise<EmailAccount[]> {
  return ok(await request(''), 'Failed to load accounts')
}

/** The backend verifies the credentials (IMAP login and SMTP handshake) before saving. */
export async function connectImap(input: ImapAccountInput): Promise<EmailAccount> {
  return ok(
    await request('/imap', { method: 'POST', body: JSON.stringify(input) }),
    'Could not connect the mailbox',
  )
}

/** Returns the provider consent URL; the backend handles the callback and redirects back here. */
export async function startOAuth(
  provider: 'google' | 'microsoft',
  redirectPath: string,
): Promise<string> {
  // The API only accepts a relative path or a URL on its own origin.
  const redirect = encodeURIComponent(redirectPath)
  const data = await ok<{ url: string }>(
    await request(`/oauth/${provider}/start?redirect=${redirect}`),
    'Could not start sign-in',
  )
  return data.url
}

export async function disconnectAccount(id: string): Promise<void> {
  await ok<void>(
    await request(`/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    'Could not disconnect',
  )
}