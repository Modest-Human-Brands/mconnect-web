export interface RuntimeConfig {
  apiBaseUrl?: string
  siteUrl?: string
  /** Notion page id (or slug) of the organization, sent as `x-org-id`. */
  organizationId?: string
  /** Notion page id of the signed-in team member, attached to outbound emails. */
  userId?: string
  /** Sent as `x-api-key` on every API request. Injected at container start, never baked into a production bundle. */
  apiKey?: string
}

declare global {
  interface Window {
    __MCONNECT_CONFIG__?: RuntimeConfig
  }
}

export function pickConfig(...values: (string | undefined)[]): string {
  for (const value of values) {
    const trimmed = value?.trim()
    if (trimmed) return trimmed
  }
  return ''
}

function buildConfig(): RuntimeConfig {
  return {
    apiBaseUrl: import.meta.env.DEV ? undefined : import.meta.env.VITE_MCONNECT_WEB_API_URL,
    siteUrl: import.meta.env.VITE_MCONNECT_WEB_SITE_URL,
    organizationId: import.meta.env.ORGANIZATION_ID,
    userId: import.meta.env.DEV ? import.meta.env.VITE_MCONNECT_WEB_USER_ID : undefined,
    apiKey: import.meta.env.DEV ? import.meta.env.VITE_MCONNECT_WEB_API_KEY : undefined,
  }
}

export function readConfig(
  runtime: RuntimeConfig | undefined = typeof window === 'undefined'
    ? undefined
    : window.__MCONNECT_CONFIG__,
  build: RuntimeConfig = buildConfig(),
) {
  return {
    apiBaseUrl: pickConfig(runtime?.apiBaseUrl, build.apiBaseUrl),
    siteUrl: pickConfig(runtime?.siteUrl, build.siteUrl),
    organizationId: pickConfig(runtime?.organizationId, build.organizationId),
    userId: pickConfig(runtime?.userId, build.userId),
    apiKey: pickConfig(runtime?.apiKey, build.apiKey),
  }
}

const STORAGE_KEY = 'mconnect.access'

/** Credentials typed into the Setup screen; they stay in this browser only. */
function readStored(): RuntimeConfig {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, unknown>
    const text = (value: unknown) => (typeof value === 'string' ? value : undefined)
    return {
      organizationId: text(raw.organizationId),
      userId: text(raw.userId),
      apiKey: text(raw.apiKey),
    }
  } catch {
    return {}
  }
}

export const config = readConfig(
  typeof window === 'undefined' ? undefined : window.__MCONNECT_CONFIG__,
  { ...buildConfig(), ...definedOnly(readStored()) },
)

function definedOnly(values: RuntimeConfig): RuntimeConfig {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value?.trim()),
  ) as RuntimeConfig
}

/** The API needs the organization, the acting user and the key; without all three, show Setup. */
export function isConfigured(
  current: Pick<typeof config, 'organizationId' | 'userId' | 'apiKey'> = config,
) {
  return Boolean(current.organizationId && current.userId && current.apiKey)
}

export interface AccessInput {
  organizationId: string
  userId: string
  apiKey: string
}

/** Remembers the access details in this browser and applies them to the live config. */
export function saveAccess(input: AccessInput): void {
  const next = {
    organizationId: input.organizationId.trim(),
    userId: input.userId.trim(),
    apiKey: input.apiKey.trim(),
  }
  Object.assign(config, next)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage can be blocked (private window); the details then last for this tab only.
  }
}

export function clearAccess(): void {
  Object.assign(config, { organizationId: '', userId: '', apiKey: '' })
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing stored to clear.
  }
}