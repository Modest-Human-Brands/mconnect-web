export interface RuntimeConfig {
  apiBaseUrl?: string
  siteUrl?: string
  /** Notion page id (or slug) of the organization, sent as `x-org-id`. */
  organizationId?: string
  /** Notion page id of the signed-in team member, attached to outbound emails. */
  userId?: string
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
    apiBaseUrl: import.meta.env.DEV ? undefined : import.meta.env.VITE_MCONNECT_API_URL,
    siteUrl: import.meta.env.VITE_PUBLIC_SITE_URL,
    organizationId: import.meta.env.VITE_DEFAULT_ORGANIZATION_ID,
    userId: import.meta.env.VITE_MCONNECT_USER_ID,
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
  }
}

export const config = readConfig()