import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useDebounceFn } from '@vueuse/core'

import { fetchTemplateList, fetchTemplateSchema, renderPreview, sendEmail } from '@/api/mconnect'
import type { SendEmailResult } from '@/api/types'
import { buildVariables, initFormDataFromSchema, transformSchema } from '@/lib/transform'
import type { TemplateListItem, TemplateSchema } from '@/types/email'

export type EmailStatus = 'idle' | 'loading-templates' | 'loading-schema' | 'rendering' | 'error'

export const EMAIL_STEPS = [
  { label: 'Template', path: '/email/new/template' },
  { label: 'Details', path: '/email/new/details' },
  { label: 'Review & send', path: '/email/new/review' },
] as const

/** Sender shown in templates that read `organization`. */
const ORGANIZATION = { name: 'Modest Human Brands', legalName: 'Modest Human Brands' }

export const useEmailWizardStore = defineStore('emailWizard', () => {
  const templates = ref<TemplateListItem[]>([])
  const templateId = ref<string | null>(null)
  const schema = ref<TemplateSchema | null>(null)
  const formData = ref<Record<string, unknown>>({})
  const previewHtml = ref('')
  const status = ref<EmailStatus>('idle')
  const errorMessage = ref('')

  let controller: AbortController | null = null

  const template = computed(() => templates.value.find((t) => t.id === templateId.value) ?? null)
  const fields = computed(() => (schema.value ? transformSchema(schema.value.variables ?? {}) : []))
  const categories = computed(() => {
    const counts = new Map<string, number>()
    for (const t of templates.value) counts.set(t.category, (counts.get(t.category) ?? 0) + 1)
    return [...counts].map(([name, count]) => ({ name, count }))
  })

  async function loadTemplates(): Promise<void> {
    if (templates.value.length) return
    status.value = 'loading-templates'
    errorMessage.value = ''
    try {
      templates.value = await fetchTemplateList()
      status.value = 'idle'
      const first = templates.value[0]
      if (first && !templateId.value) await selectTemplate(first.id)
    } catch (err) {
      status.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Could not load templates.'
    }
  }

  async function selectTemplate(id: string): Promise<void> {
    if (id === templateId.value && schema.value) return
    templateId.value = id
    status.value = 'loading-schema'
    errorMessage.value = ''
    try {
      const loaded = await fetchTemplateSchema(id)
      if (templateId.value !== id) return
      schema.value = loaded
      formData.value = initFormDataFromSchema(
        transformSchema(loaded.variables ?? {}),
        loaded.placeholders,
      )
      await renderNow()
    } catch (err) {
      status.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Could not load template.'
    }
  }

  async function renderNow(): Promise<void> {
    if (!templateId.value) return
    controller?.abort()
    controller = new AbortController()

    status.value = 'rendering'
    errorMessage.value = ''
    try {
      const res = await renderPreview(
        {
          templateId: templateId.value,
          variables: variables(),
        },
        controller.signal,
      )
      previewHtml.value = res.contentHtml
      status.value = 'idle'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      status.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Render failed.'
    }
  }

  const renderSoon = useDebounceFn(() => void renderNow(), 250)
  watch(formData, renderSoon, { deep: true })

  const toEmail = ref('')
  const toContactId = ref<string | null>(null)
  const accountId = ref<string | null>(null)
  const sending = ref(false)
  const sendError = ref('')

  function variables(): Record<string, unknown> {
    return { ...buildVariables(formData.value), organization: ORGANIZATION }
  }

  /** Delivers the email through the API, which also logs it to the CRM. */
  async function send(): Promise<SendEmailResult | null> {
    if (!templateId.value || !toEmail.value) return null
    sending.value = true
    sendError.value = ''
    try {
      return await sendEmail({
        template: templateId.value,
        variables: variables(),
        recipientEmail: toEmail.value,
        ...(toContactId.value ? { contactId: toContactId.value } : {}),
        ...(accountId.value ? { accountId: accountId.value } : {}),
      })
    } catch (err) {
      sendError.value = err instanceof Error ? err.message : 'Could not send the email.'
      return null
    } finally {
      sending.value = false
    }
  }

  function reset() {
    controller?.abort()
    templateId.value = null
    schema.value = null
    formData.value = {}
    previewHtml.value = ''
    status.value = 'idle'
    errorMessage.value = ''
    toEmail.value = ''
    toContactId.value = null
    accountId.value = null
    sending.value = false
    sendError.value = ''
  }

  return {
    templates,
    templateId,
    template,
    schema,
    fields,
    categories,
    formData,
    previewHtml,
    status,
    errorMessage,
    toEmail,
    toContactId,
    accountId,
    sending,
    sendError,
    send,
    loadTemplates,
    selectTemplate,
    renderNow,
    reset,
  }
})