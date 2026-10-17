<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import EmailFrame from '@/components/email/EmailFrame.vue'
import WizardShell from '@/components/layout/WizardShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiField from '@/components/ui/UiField.vue'
import { useAccountsStore } from '@/stores/accounts'
import { useCrmStore } from '@/stores/crm'
import { EMAIL_STEPS, useEmailWizardStore } from '@/stores/emailWizard'

const router = useRouter()
const wizard = useEmailWizardStore()
const crm = useCrmStore()

const accountStore = useAccountsStore()
const accounts = computed(() => accountStore.accounts.filter((a) => a.status === 'connected'))

onMounted(() => {
  void crm.loadContacts()
  void accountStore.load()
})

const fromAccount = computed(
  () =>
    accounts.value.find((a) => a.id === wizard.accountId)?.address ?? accounts.value[0]?.address,
)

function pickAccount(address: string | number) {
  wizard.accountId = accounts.value.find((a) => a.address === address)?.id ?? null
}

const label = computed(() => wizard.template?.label ?? 'Email')

const PICK = 'Pick a client…'
const reachable = computed(() => crm.contacts.filter((c) => c.email))
const options = computed(() => [PICK, ...reachable.value.map((c) => c.company || c.name)])
const picked = computed(() => {
  const contact = reachable.value.find((c) => c.id === wizard.toContactId)
  return contact ? contact.company || contact.name : PICK
})

function pick(name: string | number) {
  const contact = reachable.value.find((c) => (c.company || c.name) === name)
  wizard.toContactId = contact?.id ?? null
  if (contact?.email) wizard.toEmail = contact.email
}

const validEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wizard.toEmail.trim()))

async function send() {
  wizard.toEmail = wizard.toEmail.trim()
  const result = await wizard.send()
  if (!result) return
  const subject = label.value
  crm.addSentMessage({
    id: result.emailId,
    senderName: 'You',
    senderEmail: wizard.toEmail,
    isVerified: true,
    subject,
    preview: `Sent to ${wizard.toEmail}`,
    date: new Date().toISOString(),
    contentHtml: wizard.previewHtml,
  })
  wizard.reset()
  void crm.loadMessages(true)
  await router.push(`/inbox/sent:${result.emailId}`)
}
</script>

<template>
  <WizardShell
    :steps="EMAIL_STEPS"
    :step="2"
    title="Review and send"
    subtitle="Choose who gets it. Opens and clicks are tracked once it is sent."
    :preview-label="`Final preview · ${label}`"
    exit-to="/inbox"
    :on-cancel="wizard.reset"
  >
    <section class="flex flex-col gap-3">
      <h2 class="text-xs text-muted">Send to</h2>
      <UiField
        v-if="accounts.length > 1"
        :model-value="fromAccount ?? ''"
        label="Send from"
        :options="accounts.map((a) => a.address)"
        @update:model-value="pickAccount"
      />
      <UiField :model-value="picked" label="Client" :options="options" @update:model-value="pick" />
      <UiField
        v-model="wizard.toEmail"
        label="Email address"
        type="email"
        placeholder="client@company.com"
        :error="wizard.toEmail && !validEmail ? 'Enter a valid email address.' : undefined"
        @update:model-value="wizard.toContactId = null"
      />
    </section>
    <p v-if="wizard.sendError" class="text-sm text-alert-400" role="alert">
      {{ wizard.sendError }}
    </p>

    <template #note>
      {{
        wizard.sending
          ? 'Sending…'
          : validEmail
            ? `Ready to send to ${wizard.toEmail}`
            : 'Add a recipient'
      }}
    </template>
    <template #actions>
      <UiButton
        variant="ghost"
        :disabled="wizard.sending"
        @click="router.push(EMAIL_STEPS[1].path)"
      >
        Back
      </UiButton>
      <UiButton :disabled="!validEmail || wizard.sending || !wizard.previewHtml" @click="send">
        Send email
      </UiButton>
    </template>
    <template #preview>
      <EmailFrame :html="wizard.previewHtml" :error="wizard.errorMessage" />
    </template>
  </WizardShell>
</template>