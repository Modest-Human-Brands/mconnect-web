import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

import type { Stage } from '@/domain/crm'

export const CLIENT_STEPS = [
  { label: 'Source', path: '/clients/new/source' },
  { label: 'Details', path: '/clients/new/details' },
  { label: 'Review & add', path: '/clients/new/review' },
] as const

export type ClientSource = 'manual' | 'email' | 'csv'

export const SOURCE_LABEL: Record<ClientSource, string> = {
  manual: 'Manual entry',
  email: 'From an email',
  csv: 'Import CSV',
}

function emptyForm() {
  return {
    company: '',
    contact: '',
    // Role and deal value are shown in the design but the API cannot store them yet.
    role: 'Founder',
    value: '',
    email: '',
    phone: '',
    city: '',
    project: '',
    stage: 'Lead' as Stage,
  }
}

export const useClientWizardStore = defineStore('clientWizard', () => {
  const source = ref<ClientSource>('manual')
  const form = reactive(emptyForm())
  const saving = ref(false)
  const error = ref('')

  function reset() {
    source.value = 'manual'
    Object.assign(form, emptyForm())
    saving.value = false
    error.value = ''
  }

  return { source, form, saving, error, reset }
})