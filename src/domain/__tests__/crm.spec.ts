import { describe, expect, it } from 'vite-plus/test'

import type { Contact } from '@/api/types'
import { boardStats, initialsOf, stageOf, STAGES, STATUS_FOR_STAGE, timeAgo } from '../crm'

function contact(status: string, unreadCount = 0): Contact {
  return {
    id: status,
    name: 'A',
    company: null,
    jobTitle: null,
    email: null,
    phone: null,
    instagram: null,
    status,
    lastActive: '2026-10-01T00:00:00.000Z',
    lastMessageSnippet: '',
    platforms: [],
    unreadCount,
  }
}

describe('stageOf', () => {
  it('maps Notion statuses onto board columns', () => {
    expect(stageOf('Unverified')).toBe('Lead')
    expect(stageOf('Initiate')).toBe('Contacted')
    expect(stageOf('Communicate')).toBe('Proposal')
    expect(stageOf('Converted')).toBe('Won')
  })

  it('hides statuses that are off the board', () => {
    expect(stageOf('Cancelled')).toBeNull()
    expect(stageOf('Inactive')).toBeNull()
  })

  it('round-trips every stage through the status a new contact gets', () => {
    for (const stage of STAGES) expect(stageOf(STATUS_FOR_STAGE[stage])).toBe(stage)
  })
})

describe('timeAgo', () => {
  const now = new Date('2026-10-17T12:00:00.000Z')

  it('uses coarse relative units', () => {
    expect(timeAgo('2026-10-17T11:59:40.000Z', now)).toBe('Just now')
    expect(timeAgo('2026-10-17T11:30:00.000Z', now)).toBe('30m ago')
    expect(timeAgo('2026-10-17T07:00:00.000Z', now)).toBe('5h ago')
    expect(timeAgo('2026-10-14T12:00:00.000Z', now)).toBe('3d ago')
  })

  it('returns an empty string for invalid dates', () => {
    expect(timeAgo('not a date', now)).toBe('')
  })
})

describe('initialsOf', () => {
  it('takes up to two initials', () => {
    expect(initialsOf('Rhea Kapoor')).toBe('RK')
    expect(initialsOf('chai')).toBe('C')
    expect(initialsOf('  ')).toBe('?')
  })
})

describe('boardStats', () => {
  it('derives counts from the contact list', () => {
    const stats = boardStats([contact('Unverified', 2), contact('Converted'), contact('Inactive')])
    expect(stats).toEqual([
      { label: 'Open deals', value: '1' },
      { label: 'Won', value: '1' },
      { label: 'Win rate', value: '33%' },
      { label: 'Unread replies', value: '2' },
    ])
  })

  it('does not divide by zero', () => {
    expect(boardStats([])[2]?.value).toBe('0%')
  })
})