<script setup lang="ts">
import { useRouter } from 'vue-router'

import { saveContact } from '@/api/mconnect'
import WizardShell from '@/components/layout/WizardShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import ClientPreviewCard from '@/components/wizard/ClientPreviewCard.vue'
import { STATUS_FOR_STAGE } from '@/domain/crm'
import { CLIENT_STEPS, SOURCE_LABEL, useClientWizardStore } from '@/stores/clientWizard'
import { useCrmStore } from '@/stores/crm'

const router = useRouter()
const wizard = useClientWizardStore()
const crm = useCrmStore()
const form = wizard.form

async function add() {
  wizard.saving = true
  wizard.error = ''
  try {
    await saveContact({
      brand: form.company.trim(),
      company: form.company.trim(),
      pocPerson: form.contact.trim(),
      address: form.city.trim(),
      place: form.city.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      status: STATUS_FOR_STAGE[form.stage],
      tags: form.project.trim() ? [form.project.trim()] : null,
    })
  } catch (err) {
    wizard.error = err instanceof Error ? err.message : 'Could not add the client.'
    wizard.saving = false
    return
  }
  wizard.reset()
  void crm.loadContacts(true)
  await router.push('/clients')
}
</script>

<template>
  <WizardShell
    :steps="CLIENT_STEPS"
    :step="2"
    title="Review and add"
    subtitle="Confirm the client before it lands on the board."
    preview-label="Final preview · New client"
    exit-to="/clients"
    :on-cancel="wizard.reset"
  >
    <dl
      class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg border border-line bg-raised p-4 text-sm"
    >
      <dt class="text-muted">Company</dt>
      <dd class="text-white">{{ form.company }}</dd>
      <dt class="text-muted">Contact</dt>
      <dd class="text-white">{{ form.contact }}</dd>
      <dt class="text-muted">Reach</dt>
      <dd class="text-white">{{ [form.email, form.phone].filter(Boolean).join(' · ') }}</dd>
      <dt class="text-muted">City</dt>
      <dd class="text-white">{{ form.city }}</dd>
      <dt class="text-muted">Source</dt>
      <dd class="text-white">{{ SOURCE_LABEL[wizard.source] }}</dd>
      <dt class="text-muted">Stage</dt>
      <dd class="text-white">{{ form.stage }}</dd>
    </dl>
    <p v-if="wizard.error" class="text-sm text-alert-400" role="alert">{{ wizard.error }}</p>

    <template #note>
      {{ wizard.saving ? 'Saving…' : 'Saved to the shared contact list.' }}
    </template>
    <template #actions>
      <UiButton
        variant="ghost"
        :disabled="wizard.saving"
        @click="router.push(CLIENT_STEPS[1].path)"
      >
        Back
      </UiButton>
      <UiButton :disabled="wizard.saving" @click="add">Add client</UiButton>
    </template>
    <template #preview>
      <ClientPreviewCard
        :company="form.company"
        :contact="form.contact"
        :city="form.city"
        :stage="form.stage"
        :project="form.project"
      />
    </template>
  </WizardShell>
</template>