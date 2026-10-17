<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import WizardShell from '@/components/layout/WizardShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiField from '@/components/ui/UiField.vue'
import ClientPreviewCard from '@/components/wizard/ClientPreviewCard.vue'
import { STAGES } from '@/domain/crm'
import { CLIENT_STEPS, SOURCE_LABEL, useClientWizardStore } from '@/stores/clientWizard'
import { useCrmStore } from '@/stores/crm'

const router = useRouter()
const wizard = useClientWizardStore()
const crm = useCrmStore()
const form = wizard.form

const fromEmail = computed(() => wizard.source === 'email')
const senders = computed(() => {
  const seen = new Map<string, string>()
  for (const m of crm.messages) {
    if (m.senderEmail && !seen.has(m.senderEmail)) seen.set(m.senderEmail, m.senderName)
  }
  return [...seen].map(([email, name]) => ({ email, name }))
})
const senderLabels = computed(() => senders.value.map((s) => `${s.name} <${s.email}>`))

function pickSender(label: string | number) {
  const sender = senders.value.find((s) => `${s.name} <${s.email}>` === label)
  if (!sender) return
  form.contact = sender.name
  form.email = sender.email
}

const reachable = computed(() => Boolean(form.email.trim() || form.phone.trim()))
const valid = computed(() =>
  Boolean(form.company.trim() && form.contact.trim() && form.city.trim() && reachable.value),
)
</script>

<template>
  <WizardShell
    :steps="CLIENT_STEPS"
    :step="1"
    title="Client details"
    subtitle="The client card on the right fills as you type."
    preview-label="Live preview · New client"
    exit-to="/clients"
    :on-cancel="wizard.reset"
  >
    <section class="flex flex-col gap-3">
      <h2 class="text-xs text-muted">Client</h2>
      <UiField
        v-if="fromEmail"
        :model-value="'Pick a sender…'"
        label="Sender"
        :options="['Pick a sender…', ...senderLabels]"
        @update:model-value="pickSender"
      />
      <div class="grid grid-cols-3 gap-3">
        <UiField v-model="form.company" label="Company" placeholder="Lotus Interiors" />
        <UiField v-model="form.contact" label="Contact" placeholder="Anita Rao" />
        <UiField v-model="form.city" label="City" placeholder="Pune" />
        <UiField
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="anita@lotus.in"
          class="col-span-2"
        />
        <UiField v-model="form.phone" label="Phone" type="tel" placeholder="+91 98765 43210" />
      </div>
      <p v-if="!reachable" class="text-xs text-muted">Add an email address or a phone number.</p>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-xs text-muted">Deal</h2>
      <div class="grid grid-cols-3 gap-3">
        <UiField
          v-model="form.project"
          label="Project"
          placeholder="Brand film"
          class="col-span-2"
        />
        <UiField v-model="form.stage" label="Stage" :options="STAGES" />
      </div>
      <p class="text-xs text-muted">The project is saved as a tag on the client.</p>
    </section>

    <template #note>{{ SOURCE_LABEL[wizard.source] }}</template>
    <template #actions>
      <UiButton variant="ghost" @click="router.push(CLIENT_STEPS[0].path)">Back</UiButton>
      <UiButton :disabled="!valid" @click="router.push(CLIENT_STEPS[2].path)">Review</UiButton>
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