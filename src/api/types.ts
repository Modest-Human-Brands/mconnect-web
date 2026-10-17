/** Shapes returned and accepted by the MConnect API (code-connect/server/api). */

export interface EmailMessage {
  id: string
  senderName: string
  senderEmail: string
  avatarUrl?: string
  isVerified: boolean
  subject: string
  preview: string
  /** ISO timestamp. */
  date: string
  contentHtml: string
}

export interface TelemetryTimelineEvent {
  id: string
  type: 'open' | 'click' | 'trap'
  category: 'human' | 'bot' | 'trap' | 'invalidated'
  title: string
  description: string
  timestamp: string
  targetUrl?: string
  deviceType: string
  location: string | null
}

export interface EmailTelemetry {
  emailId: string
  aggregated: {
    totalOpens: number
    totalClicks: number
    botFiltered: number
    isHoneypotTriggered: boolean
    deviceBreakdown: Record<string, number>
    topUrls: Record<string, number>
    locations: string[]
    firstActivity: string | null
    lastActivity: string | null
  }
  timeline: TelemetryTimelineEvent[]
}

export const CONTACT_STATUSES = [
  'Unverified',
  'Researched',
  'Verified',
  'Initiate',
  'Communicate',
  'Converted',
  'Cancelled',
  'Active',
  'Inactive',
  'On Hold',
] as const
export type ContactStatus = (typeof CONTACT_STATUSES)[number]

export interface Contact {
  id: string
  name: string
  company: string | null
  jobTitle: string | null
  email: string | null
  phone: string | null
  instagram: string | null
  status: string
  /** ISO timestamp of the latest interaction. */
  lastActive: string
  lastMessageSnippet: string
  platforms: string[]
  unreadCount: number
}

export interface ContactsResponse {
  results: Contact[]
  pagination: { total: number; limit: number; offset: number }
}

/** Body of `PUT /api/contacts`. `brand`, `company`, `address` and `pocPerson` are required. */
export interface ContactInput {
  brand: string
  company: string
  address: string
  pocPerson: string
  email?: string | null
  phone?: string | null
  status?: ContactStatus | null
  tags?: string[] | null
  place?: string | null
  contactId?: string | null
}

export interface ContactSaveResult {
  contactId: string
  status: 'created' | 'updated'
}

export interface SendEmailInput {
  template: string
  variables: Record<string, unknown>
  recipientEmail?: string
  contactId?: string
  /** Mailbox to send from; the API defaults to the first connected account. */
  accountId?: string
  subject?: string
  displayName?: string
}

export interface SendEmailResult {
  success: boolean
  dispatchId: string
  emailId: string
}