import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

export const MEETING_STEPS = [
  { label: 'Type', path: '/meeting/new/type' },
  { label: 'Details', path: '/meeting/new/details' },
  { label: 'Review & send', path: '/meeting/new/review' },
] as const

export interface MeetingType {
  id: string
  title: string
  category: 'Video' | 'Voice' | 'Custom'
  minutes: number
}

export const MEETING_TYPES: MeetingType[] = [
  { id: 'discovery', title: 'Discovery call', category: 'Video', minutes: 30 },
  { id: 'proposal', title: 'Proposal review', category: 'Video', minutes: 45 },
  { id: 'check-in', title: 'Quick check-in', category: 'Voice', minutes: 15 },
  { id: 'shoot', title: 'Shoot planning', category: 'Video', minutes: 60 },
  { id: 'review', title: 'Client review', category: 'Video', minutes: 45 },
]

function defaults() {
  return {
    ref: 'MHB-M-26-014',
    date: '2026-10-15',
    time: '15:00',
    duration: 45,
    deal: 'Monsoon Masala film',
    topic: 'Proposal v3 walkthrough',
    location: 'MConnect video room',
    recording: 'Off',
    guestName: 'Rhea Kapoor',
    guestEmail: 'rhea@chaitheory.in',
  }
}

export const useMeetingWizardStore = defineStore('meetingWizard', () => {
  const typeId = ref<string | null>('proposal')
  const form = reactive(defaults())

  function selectType(id: string | null) {
    typeId.value = id
    const type = MEETING_TYPES.find((t) => t.id === id)
    if (type) form.duration = type.minutes
  }

  function reset() {
    typeId.value = 'proposal'
    Object.assign(form, defaults())
  }

  return { typeId, form, selectType, reset }
})