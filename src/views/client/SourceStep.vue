<script setup lang="ts">
import { useRouter } from 'vue-router'

import WizardShell from '@/components/layout/WizardShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import ClientPreviewCard from '@/components/wizard/ClientPreviewCard.vue'
import {
  CLIENT_STEPS,
  SOURCE_LABEL,
  useClientWizardStore,
  type ClientSource,
} from '@/stores/clientWizard'
import { useCrmStore } from '@/stores/crm'
import IconChevronRight from '~icons/lucide/chevron-right'
import IconFileSpreadsheet from '~icons/lucide/file-spreadsheet'
import IconMail from '~icons/lucide/mail'
import IconPlus from '~icons/lucide/plus'

const router = useRouter()
const wizard = useClientWizardStore()
const crm = useCrmStore()

const SOURCES: {
  key: ClientSource
  title: string
  description: string
  icon: unknown
  disabled?: boolean
}[] = [
  {
    key: 'manual',
    title: 'Add manually',
    description: 'Enter the client yourself',
    icon: IconPlus,
  },
  {
    key: 'email',
    title: 'From an email',
    description: 'Pick a sender from your inbox',
    icon: IconMail,
  },
  {
    key: 'csv',
    title: 'Import CSV',
    description: 'Not available yet: the API adds one contact at a time',
    icon: IconFileSpreadsheet,
    disabled: true,
  },
]

function choose(key: ClientSource) {
  wizard.source = key
  if (key === 'email') void crm.loadMessages()
}
</script>

<template>
  <WizardShell
    :steps="CLIENT_STEPS"
    :step="0"
    title="How do you want to add the client?"
    subtitle="Pick a source. You can edit everything before saving."
    preview-label="Preview · New client"
    exit-to="/clients"
    :on-cancel="wizard.reset"
  >
    <ul class="flex flex-col gap-3">
      <li v-for="source in SOURCES" :key="source.key">
        <button
          type="button"
          :disabled="source.disabled"
          class="flex w-full items-center gap-3 rounded-lg border bg-raised p-4 text-left outline-none focus-visible:shadow-focus-ring disabled:opacity-50"
          :class="
            wizard.source === source.key ? 'border-primary-400' : 'border-line hover:bg-overlay/40'
          "
          :aria-pressed="wizard.source === source.key"
          @click="choose(source.key)"
        >
          <span class="flex size-8 items-center justify-center rounded-full bg-overlay text-white">
            <component :is="source.icon" class="size-4" aria-hidden="true" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-sm font-medium text-white">{{ source.title }}</span>
            <span class="text-xs text-muted">{{ source.description }}</span>
          </span>
          <IconChevronRight class="size-4 text-muted" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <template #note>{{ SOURCE_LABEL[wizard.source] }} selected</template>
    <template #actions>
      <UiButton @click="router.push(CLIENT_STEPS[1].path)">Continue</UiButton>
    </template>
    <template #preview>
      <ClientPreviewCard
        :company="wizard.form.company"
        :contact="wizard.form.contact"
        :city="wizard.form.city"
        :stage="wizard.form.stage"
        :project="wizard.form.project"
        :email="wizard.form.email"
      />
    </template>
  </WizardShell>
</template>