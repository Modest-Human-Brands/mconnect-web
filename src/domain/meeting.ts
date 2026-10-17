import type { MeetingType } from '@/stores/meetingWizard'

export interface InviteBody {
  tag: string
  title: string
  intro: string[]
  facts: [string, string][]
}

export interface MeetingForm {
  date: string
  time: string
  duration: number
  topic: string
  location: string
  guestName: string
  guestEmail: string
}

function toDate(date: string, time: string): Date | null {
  const value = new Date(`${date}T${time || '00:00'}`)
  return Number.isNaN(value.getTime()) ? null : value
}

export function formatWhen(date: string, time: string): string {
  const value = toDate(date, time)
  if (!value) return 'Date to be set'
  const day = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
    .format(value)
    .replace(',', '')
  const clock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(
    value,
  )
  return `${day}, ${clock}`
}

export function formatRange(date: string, time: string, minutes: number): string {
  const start = toDate(date, time)
  if (!start) return ''
  const end = new Date(start.getTime() + minutes * 60_000)
  const clock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${clock.format(start)} to ${clock.format(end)}`
}

export function inviteBody(form: MeetingForm, type: MeetingType | undefined): InviteBody {
  const firstName = form.guestName.split(/\s+/)[0] || 'there'
  const title = type?.title ?? 'Meeting'
  return {
    tag: `${(type?.category ?? 'Video').toUpperCase()} MEETING`,
    title: form.guestName ? `${title}, ${form.guestName}` : title,
    intro: [
      `Hi ${firstName},`,
      `You are invited to join "${form.topic || title}". Join from the link in this invite at the time shown below.`,
    ],
    facts: [
      ['When:', formatWhen(form.date, form.time)],
      ['Where:', form.location || 'MConnect video room'],
      ['Guests:', form.guestName || 'To be added'],
    ],
  }
}