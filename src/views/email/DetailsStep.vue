<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import EmailFrame from '@/components/email/EmailFrame.vue'
import SchemaForm from '@/components/email/SchemaForm.vue'
import WizardShell from '@/components/layout/WizardShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { EMAIL_STEPS, useEmailWizardStore } from '@/stores/emailWizard'

const router = useRouter()
const wizard = useEmailWizardStore()

const label = computed(() => wizard.template?.label ?? 'Email')
const rendering = computed(() => wizard.status === 'rendering')
const note = computed(() => {
  if (wizard.status === 'error') return wizard.errorMessage
  return rendering.value ? 'Updating preview…' : 'Preview is up to date'
})
</script>

<template>
  <WizardShell
    :steps="EMAIL_STEPS"
    :step="1"
    :title="`${label} details`"
    subtitle="Fields fill the email as you type."
    :preview-label="`Live preview · ${label}`"
    exit-to="/inbox"
    :on-cancel="wizard.reset"
  >
    <SchemaForm v-model="wizard.formData" :fields="wizard.fields" />

    <template #note>{{ note }}</template>
    <template #actions>
      <UiButton variant="ghost" @click="router.push(EMAIL_STEPS[0].path)">Back</UiButton>
      <UiButton :disabled="!wizard.previewHtml" @click="router.push(EMAIL_STEPS[2].path)">
        Review &amp; send
      </UiButton>
    </template>
    <template #preview>
      <EmailFrame :html="wizard.previewHtml" :loading="rendering" :error="wizard.errorMessage" />
    </template>
  </WizardShell>
</template>