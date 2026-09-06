import type {
  TemplateListItem,
  TemplateSchema,
  PreviewRequestPayload,
  PreviewResponse,
} from '../types/email'

export interface MockEmailVariables {
  recipient?: { name?: string }
  emailSubject?: string
  pitchMessage?: string
  content?: { excerpt?: string }
  organization?: {
    branding?: {
      color?: {
        primary?: string
        accent?: string
      }
    }
  }
  [key: string]: unknown
}

export const DEMO_TEMPLATES: TemplateListItem[] = [
  {
    id: 'outreach',
    label: 'Outreach',
    description: 'Cold outreach and brand pitch campaign featuring targeted service showcases.',
    category: 'Outreach',
    thumbnail: '',
  },
  {
    id: 'content-release',
    label: 'Content Release',
    description: 'Notification announcing newly published blog posts, articles, or insights.',
    category: 'Marketing',
    thumbnail: '',
  },
]

const BASE_URL = import.meta.env.VUE_PUBLIC_SITE_URL || ''

const DEMO_SCHEMA: TemplateSchema = {
  id: 'outreach',
  label: 'Outreach',
  description: 'Cold outreach and brand pitch campaign.',
  variables: {
    recipient: {
      name: 'string',
    },
    emailSubject: 'string',
    heroHeadline: 'string',
    pitchMessage: 'string',
    ctaText: 'string',
    ctaButtons: {
      label: 'string',
      url: 'string',
    },
  },
  placeholders: {
    recipient: {
      name: 'Sarah Jenkins',
    },
    emailSubject: 'Collaboration Proposal with MHB',
    heroHeadline: 'Elevate Your Studio Output',
    pitchMessage:
      'We help modern creative brands eliminate workflow friction and scale production.',
    ctaText: 'Schedule a Call',
    ctaButtons: {
      label: 'View Case Studies',
      url: 'https://modesthumanbrands.com/work',
    },
  },
}

export async function fetchTemplateList(): Promise<TemplateListItem[]> {
  if (!BASE_URL) return DEMO_TEMPLATES
  const res = await fetch(`${BASE_URL}/api/interaction/email/template`)
  if (!res.ok) throw new Error(`Failed to load templates (${res.status})`)
  return res.json()
}

export async function fetchTemplateSchema(id: string): Promise<TemplateSchema> {
  if (!BASE_URL) return { ...DEMO_SCHEMA, id }
  const res = await fetch(`${BASE_URL}/api/interaction/email/template/${id}`)
  if (!res.ok) throw new Error(`Failed to load template schema (${res.status})`)
  return res.json()
}

export async function renderPreview(
  payload: PreviewRequestPayload,
  signal?: AbortSignal,
): Promise<PreviewResponse> {
  if (!BASE_URL) {
    const vars = payload.variables as MockEmailVariables
    return {
      contentHtml: `<!doctype html><html><body style="font-family:sans-serif;padding:32px;">
        <h2 style="color:${vars.organization?.branding?.color?.primary || '#111827'}">
          ${vars.emailSubject || 'Template Preview'}
        </h2>
        <p>Hi ${vars.recipient?.name || 'there'},</p>
        <p>${vars.pitchMessage || vars.content?.excerpt || 'Sample content.'}</p>
      </body></html>`,
    }
  }

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