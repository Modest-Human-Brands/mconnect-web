import type { Contact, ContactStatus } from '@/api/types'

/** Board columns from the design, in order. */
export const STAGES = ['Lead', 'Contacted', 'Proposal', 'Negotiation', 'Won'] as const
export type Stage = (typeof STAGES)[number]

/**
 * The API tracks a Notion `Status` per contact, not a sales stage. Each stage owns the statuses
 * below; `Cancelled` and `Inactive` contacts fall off the board.
 */
const STAGE_STATUSES: Record<Stage, readonly string[]> = {
  Lead: ['Unverified', 'Researched', 'Verified'],
  Contacted: ['Initiate', 'Active'],
  Proposal: ['Communicate'],
  Negotiation: ['On Hold'],
  Won: ['Converted'],
}

/** The status a new contact gets when it is created in a given stage. */
export const STATUS_FOR_STAGE: Record<Stage, ContactStatus> = {
  Lead: 'Unverified',
  Contacted: 'Initiate',
  Proposal: 'Communicate',
  Negotiation: 'On Hold',
  Won: 'Converted',
}

export function stageOf(status: string): Stage | null {
  return STAGES.find((stage) => STAGE_STATUSES[stage].includes(status)) ?? null
}

export interface Member {
  initials: string
  name: string
  email: string
  role: string
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  const first = words[0]?.[0] ?? ''
  const second = words.length > 1 ? (words[1]?.[0] ?? '') : ''
  return (first + second).toUpperCase()
}

/** "3d ago", "5h ago", "Just now"; falls back to a short date after a week. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''
  const seconds = Math.max(0, Math.round((now.getTime() - then.getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(then)
}

export interface BoardStat {
  label: string
  value: string
}

/** Headline numbers derivable from the contact list. */
export function boardStats(contacts: readonly Contact[]): BoardStat[] {
  const converted = contacts.filter((c) => stageOf(c.status) === 'Won').length
  const open = contacts.filter((c) => {
    const stage = stageOf(c.status)
    return stage !== null && stage !== 'Won'
  }).length
  const unread = contacts.reduce((sum, c) => sum + c.unreadCount, 0)
  const rate = contacts.length ? Math.round((converted / contacts.length) * 100) : 0

  return [
    { label: 'Open deals', value: String(open) },
    { label: 'Won', value: String(converted) },
    { label: 'Win rate', value: `${rate}%` },
    { label: 'Unread replies', value: String(unread) },
  ]
}