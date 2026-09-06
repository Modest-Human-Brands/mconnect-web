import { computed, reactive, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { TemplateListItem, TemplateSchema, BrandSettings, BuilderStatus } from '../types/email'
import { fetchTemplateList, fetchTemplateSchema, renderPreview } from '../lib/api'
import {
  transformSchema,
  flattenObject,
  initFormDataFromSchema,
  retransformTemplateData,
  type TransformedField,
  type FieldResolver,
} from '../lib/transform'

export function useEmailBuilder() {
  const templates = ref<TemplateListItem[]>([])
  const templateId = ref<string | null>(null)
  const schema = ref<TemplateSchema | null>(null)

  const brand = reactive<BrandSettings>({
    companyName: 'Modest Human Brands',
    legalName: 'Modest Human Brands LLP',
    logoDataUrl: '',
    logoName: '',
    colorPrimary: '#111827',
    colorAccent: '#0284c7',
    font: 'Exo2',
    contactEmail: 'hello@modesthumanbrands.com',
    website: 'https://modesthumanbrands.com',
    footerNote: '© 2026 Modest Human Brands. All rights reserved.',
  })

  const formData = ref<Record<string, unknown>>({})
  const previewHtml = ref<string>('')
  const status = ref<BuilderStatus>('idle')
  const errorMessage = ref<string>('')

  const fieldResolvers: Record<string, FieldResolver> = {}

  let abortController: AbortController | null = null

  const fields = computed<TransformedField[]>(() => {
    if (!schema.value?.variables) return []
    return transformSchema(schema.value.variables)
  })

  const placeholders = computed<Record<string, unknown>>(() => {
    if (!schema.value?.placeholders) return {}
    return flattenObject(schema.value.placeholders)
  })

  async function loadTemplates(): Promise<void> {
    status.value = 'loading-templates'
    errorMessage.value = ''
    try {
      templates.value = await fetchTemplateList()
      const firstTemplate = templates.value[0]
      if (firstTemplate && !templateId.value) {
        await selectTemplate(firstTemplate.id)
      } else {
        status.value = 'idle'
      }
    } catch (err: unknown) {
      status.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Could not load templates.'
    }
  }

  async function selectTemplate(id: string): Promise<void> {
    templateId.value = id
    status.value = 'loading-schema'
    errorMessage.value = ''
    try {
      schema.value = await fetchTemplateSchema(id)
      const transformedFields = transformSchema(schema.value.variables || {})
      formData.value = initFormDataFromSchema(transformedFields)
      await refreshPreviewNow()
    } catch (err: unknown) {
      status.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Could not load template schema.'
    }
  }

  const debouncedRefresh = useDebounceFn(() => {
    void refreshPreviewNow()
  }, 250)

  async function refreshPreviewNow(): Promise<void> {
    if (!templateId.value) return

    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    status.value = 'rendering'
    errorMessage.value = ''

    try {
      const deepVariables = await retransformTemplateData(formData.value, brand, fieldResolvers)

      const res = await renderPreview(
        {
          templateId: templateId.value,
          variables: deepVariables,
        },
        abortController.signal,
      )

      previewHtml.value = res.contentHtml
      status.value = 'idle'
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'name' in err &&
        (err as { name: string }).name === 'AbortError'
      ) {
        return
      }
      status.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Render failed.'
    }
  }

  watch([formData, brand], debouncedRefresh, { deep: true })

  function onLogoFile(file: File): void {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      brand.logoDataUrl = typeof reader.result === 'string' ? reader.result : ''
      brand.logoName = file.name
    }
    reader.readAsDataURL(file)
  }

  function clearLogo(): void {
    brand.logoDataUrl = ''
    brand.logoName = ''
  }

  return {
    templates,
    templateId,
    schema,
    fields,
    placeholders,
    brand,
    formData,
    previewHtml,
    status,
    errorMessage,
    loadTemplates,
    selectTemplate,
    onLogoFile,
    clearLogo,
    refreshPreviewNow,
  }
}