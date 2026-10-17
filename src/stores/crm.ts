import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchContacts, fetchMessages, fetchTelemetry } from '@/api/mconnect'
import type { Contact, EmailMessage, EmailTelemetry } from '@/api/types'
import { stageOf, type Stage } from '@/domain/crm'

const ONBOARDED_KEY = 'mconnect:onboarded'

function readOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1'
  } catch {
    return false
  }
}

function message(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export const useCrmStore = defineStore('crm', () => {
  const contacts = ref<Contact[]>([])
  const contactsLoaded = ref(false)
  const contactsLoading = ref(false)
  const contactsError = ref('')

  const messages = ref<EmailMessage[]>([])
  const messagesLoaded = ref(false)
  const messagesLoading = ref(false)
  const messagesError = ref('')

  const telemetry = ref<Record<string, EmailTelemetry | null>>({})
  const onboarded = ref(readOnboarded())

  const byStage = computed(
    () => (stage: Stage) => contacts.value.filter((c) => stageOf(c.status) === stage),
  )

  async function loadContacts(force = false): Promise<void> {
    if (contactsLoading.value || (contactsLoaded.value && !force)) return
    contactsLoading.value = true
    contactsError.value = ''
    try {
      contacts.value = await fetchContacts()
      contactsLoaded.value = true
    } catch (err) {
      contactsError.value = message(err, 'Could not load clients.')
    } finally {
      contactsLoading.value = false
    }
  }

  async function loadMessages(force = false): Promise<void> {
    if (messagesLoading.value || (messagesLoaded.value && !force)) return
    messagesLoading.value = true
    messagesError.value = ''
    try {
      const fetched = await fetchMessages()
      // Keep emails sent this session that the server has not synced yet.
      const known = new Set(fetched.map((m) => m.id))
      const pending = messages.value.filter(
        (m) => m.id.startsWith('sent:') && !known.has(m.id.slice('sent:'.length)),
      )
      messages.value = [...pending, ...fetched]
      messagesLoaded.value = true
    } catch (err) {
      messagesError.value = message(err, 'Could not load the inbox.')
    } finally {
      messagesLoading.value = false
    }
  }

  /** Show a just-sent email before the server's next sync includes it. */
  function addSentMessage(entry: Omit<EmailMessage, 'id'> & { id: string }): void {
    messages.value.unshift({ ...entry, id: `sent:${entry.id}` })
  }

  async function loadTelemetry(emailId: string): Promise<void> {
    if (emailId in telemetry.value || emailId.startsWith('sent:')) return
    try {
      telemetry.value[emailId] = await fetchTelemetry(emailId)
    } catch {
      // Activity is supplementary; the email itself still renders without it.
      telemetry.value[emailId] = null
    }
  }

  function finishOnboarding() {
    onboarded.value = true
    try {
      localStorage.setItem(ONBOARDED_KEY, '1')
    } catch {
      // Storage can be unavailable (private mode); the flag then lasts for this session only.
    }
  }

  return {
    contacts,
    contactsLoaded,
    contactsLoading,
    contactsError,
    messages,
    messagesLoaded,
    messagesLoading,
    messagesError,
    telemetry,
    onboarded,
    byStage,
    loadContacts,
    loadMessages,
    loadTelemetry,
    addSentMessage,
    finishOnboarding,
  }
})