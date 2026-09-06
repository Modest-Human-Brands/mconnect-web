<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import TemplatePicker from './components/TemplatePicker.vue'
import BrandForm from './components/BrandForm.vue'
import VariableForm from './components/VariableForm.vue'
import PreviewPanel from './components/PreviewPanel.vue'
import CopyBar from './components/CopyBar.vue'
import { useEmailBuilder } from './composables/useEmailBuilder.ts'

const {
  templates,
  templateId,
  fields,
  placeholders,
  brand,
  formData,
  previewHtml,
  status,
  errorMessage,
  loadTemplates,
  selectTemplate,
} = useEmailBuilder()

onMounted(loadTemplates)

const activePane = ref<'controls' | 'preview' | 'variables'>('controls')
const previewPanel = ref<InstanceType<typeof PreviewPanel> | null>(null)

const activeTemplate = computed(() => templates.value.find((t) => t.id === templateId.value))

function copyFromBar(): void {
  previewPanel.value?.copyRich()
}

function handleSave(): void {
  // Save or export configuration payload
  const payload = {
    templateId: templateId.value,
    brand: brand,
    variables: formData,
  }
  console.log('Saved Configuration:', payload)
}
</script>

<template>
  <div class="min-h-screen bg-black font-main text-white">
    <AppHeader
      :active-pane="activePane"
      :active-template-name="activeTemplate?.label || 'Outreach'"
      @toggle-pane="(p) => (activePane = p)"
      @save="handleSave"
    />

    <p
      v-if="status === 'error'"
      class="mx-5 mt-4 rounded-md border border-alert-600 bg-alert-600/10 px-4 py-2 text-base text-alert-400"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <main
      class="lg:grid lg:grid-cols-[330px_minmax(0,1fr)_330px] xl:grid-cols-[380px_minmax(0,1fr)_360px]"
    >
      <!-- Left Panel: Templates & Organization Details -->
      <section
        class="space-y-6 border-r border-dark-600 bg-black px-4 py-5 lg:block lg:h-[calc(100vh-57px)] lg:overflow-y-auto"
        :class="activePane === 'controls' ? 'block' : 'hidden lg:block'"
      >
        <TemplatePicker :templates="templates" :selected-id="templateId" @select="selectTemplate" />
        <BrandForm :brand="brand" />
      </section>

      <!-- Center Panel: Email Preview Canvas -->
      <section
        class="border-r border-dark-600 bg-black p-4 pb-0 lg:block lg:h-[calc(100vh-57px)] lg:overflow-y-auto"
        :class="activePane === 'preview' ? 'block' : 'hidden lg:block'"
      >
        <PreviewPanel
          ref="previewPanel"
          :content-html="previewHtml"
          :is-rendering="status === 'rendering'"
          :has-template="!!templateId"
        />
      </section>

      <!-- Right Panel: Dynamic Variables -->
      <section
        class="bg-black px-4 py-5 lg:block lg:h-[calc(100vh-57px)] lg:overflow-y-auto"
        :class="activePane === 'variables' ? 'block' : 'hidden lg:block'"
      >
        <VariableForm :fields="fields" :form-data="formData" :placeholders="placeholders" />
      </section>
    </main>

    <CopyBar @copy-rich="copyFromBar" @view-preview="activePane = 'preview'" />
  </div>
</template>