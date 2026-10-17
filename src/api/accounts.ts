import { ApiError } from '@/api/mconnect'
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
  if (!config.organizationId) {
    throw new ApiError('Set VITE_DEFAULT_ORGANIZATION_ID to manage accounts.', 400)
  }
  return fetch(`${config.apiBaseUrl.replace(/\/$/, '')}/api/email/accounts${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'x-org-id': config.organizationId },
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
export async function startOAuth(provider: 'google' | 'microsoft'): Promise<string> {
  // The API only accepts a relative path or a URL on its own origin.
  const redirect = encodeURIComponent('/onboarding')
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