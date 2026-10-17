<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import EmailFrame from '@/components/email/EmailFrame.vue'
import WizardShell from '@/components/layout/WizardShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiFilterChip from '@/components/ui/UiFilterChip.vue'
import { EMAIL_STEPS, useEmailWizardStore } from '@/stores/emailWizard'
import IconCheck from '~icons/lucide/check'
import IconPlus from '~icons/lucide/plus'

const router = useRouter()
const wizard = useEmailWizardStore()
const category = ref<string | null>(null)

onMounted(() => void wizard.loadTemplates())

const visible = computed(() =>
  category.value ? wizard.templates.filter((t) => t.category === category.value) : wizard.templates,
)

const note = computed(() =>
  wizard.template ? `${wizard.template.label} selected` : 'Pick a template to continue',
)

const loading = computed(
  () =>
    wizard.status === 'loading-templates' ||
    wizard.status === 'loading-schema' ||
    wizard.status === 'rendering',
)

function cancel() {
  wizard.reset()
}
</script>

<template>
  <WizardShell
    :steps="EMAIL_STEPS"
    :step="0"
    title="Start from a template"
    subtitle="Pick one to preview the email. You can switch any time before filling details."
    :preview-label="`Preview · ${wizard.template?.label ?? 'Email'} · sample data`"
    exit-to="/inbox"
    :on-cancel="cancel"
  >
    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter templates">
      <UiFilterChip :active="category === null" @click="category = null">
        All {{ wizard.templates.length }}
      </UiFilterChip>
      <UiFilterChip
        v-for="c in wizard.categories"
        :key="c.name"
        :active="category === c.name"
        @click="category = c.name"
      >
        {{ c.name }} {{ c.count }}
      </UiFilterChip>
    </div>

    <p
      v-if="wizard.status === 'error' && !wizard.templates.length"
      class="rounded-md border border-alert-500/40 bg-raised p-4 text-sm text-alert-400"
      role="alert"
    >
      {{ wizard.errorMessage }}
      <button type="button" class="ml-2 underline" @click="wizard.loadTemplates()">Retry</button>
    </p>
    <p v-else-if="wizard.status === 'loading-templates'" class="text-sm text-muted" role="status">
      Loading templates…
    </p>

    <ul class="grid grid-cols-3 gap-3">
      <li v-for="t in visible" :key="t.id">
        <button
          type="button"
          class="flex w-full flex-col gap-3 rounded-lg border bg-raised p-2 text-left outline-none transition-colors focus-visible:shadow-focus-ring"
          :class="
            wizard.templateId === t.id ? 'border-primary-400' : 'border-overlay hover:border-line'
          "
          :aria-pressed="wizard.templateId === t.id"
          @click="wizard.selectTemplate(t.id)"
        >
          <span
            class="relative flex aspect-[1.2] w-full items-center justify-center overflow-hidden rounded-md bg-overlay"
          >
            <img
              v-if="t.thumbnail"
              :src="t.thumbnail"
              :alt="`${t.label} thumbnail`"
              class="h-full w-full object-contain p-2"
              loading="lazy"
            />
            <span
              v-if="wizard.templateId === t.id"
              class="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-white"
            >
              <IconCheck class="size-3 [--icon-stroke:3]" aria-hidden="true" />
              <span class="sr-only">Selected</span>
            </span>
          </span>
          <span class="flex flex-col px-1 pb-1">
            <span class="text-sm font-medium text-white">{{ t.label }}</span>
            <span class="text-xs text-muted">{{ t.category }}</span>
          </span>
        </button>
      </li>
      <li v-if="wizard.templates.length">
        <button
          type="button"
          class="flex h-full min-h-32 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line px-3 text-center text-muted"
          disabled
          title="Blank emails are not supported by the API yet"
        >
          <IconPlus class="size-5 text-white" aria-hidden="true" />
          <span class="text-sm font-medium text-white">Blank email</span>
          <span class="text-xs">No template, write freely</span>
        </button>
      </li>
    </ul>

    <template #note>{{ note }}</template>
    <template #actions>
      <UiButton :disabled="!wizard.template || loading" @click="router.push(EMAIL_STEPS[1].path)">
        Continue
      </UiButton>
    </template>
    <template #preview>
      <EmailFrame :html="wizard.previewHtml" :loading="loading" :error="wizard.errorMessage" />
    </template>
  </WizardShell>
</template>