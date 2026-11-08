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

export const config = readConfig()