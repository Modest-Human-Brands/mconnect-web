<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiChip from '@/components/ui/UiChip.vue'
import { useAccountsStore } from '@/stores/accounts'
import { useCrmStore } from '@/stores/crm'

const PROVIDER_LABEL = {
  google: 'Google Workspace',
  microsoft: 'Microsoft 365',
  imap: 'Other email (IMAP)',
}

const router = useRouter()
const route = useRoute()
const accounts = useAccountsStore()
const crm = useCrmStore()

const callbackError = typeof route.query.emailError === 'string' ? route.query.emailError : ''

onMounted(() => {
  void accounts.load()
  void crm.loadContacts(true)
  void crm.loadMessages(true)
})

const account = computed(() => accounts.accounts[0])

// Counts come from what the API has synced so far; there is no sync-progress endpoint yet.
const stats = computed(() => {
  const senders = new Set(crm.messages.map((m) => m.senderEmail.toLowerCase()))
  const matched = crm.contacts.filter((c) => c.email && senders.has(c.email.toLowerCase())).length
  return [
    { label: 'Emails', value: crm.messages.length },
    { label: 'Contacts', value: crm.contacts.length },
    { label: 'Clients matched', value: matched },
  ]
})

async function finish() {
  crm.finishOnboarding()
  await router.push('/clients')
}
</script>

<template>
  <OnboardingShell
    :step="3"
    :title="account ? 'You\'re connected' : 'Nothing connected yet'"
    :subtitle="
      account
        ? `${account.address} is syncing. Emails from known clients are filed on their timeline automatically.`
        : 'Connect a mailbox to start filing client emails on their timeline.'
    "
  >
    <p v-if="callbackError" class="text-sm text-alert-400" role="alert">{{ callbackError }}</p>

    <div v-if="account" class="flex items-center gap-3 rounded-lg border border-line bg-raised p-4">
      <UiAvatar :label="account.provider[0]?.toUpperCase() ?? '?'" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-white">{{ account.address }}</p>
        <p class="truncate text-xs text-muted">{{ PROVIDER_LABEL[account.provider] }}</p>
      </div>
      <UiChip :tone="account.status === 'connected' ? 'success' : 'neutral'">
        {{ account.status === 'connected' ? 'Connected' : 'Needs attention' }}
      </UiChip>
      <UiButton
        variant="secondary"
        :disabled="accounts.busy"
        @click="accounts.remove(account.id).then(() => router.push('/onboarding'))"
      >
        Disconnect
      </UiButton>
    </div>
    <p v-if="account?.detail" class="text-xs text-alert-400">{{ account.detail }}</p>

    <dl class="grid grid-cols-3 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg border border-line bg-raised p-4"
      >
        <dt class="text-xs text-muted">{{ stat.label }}</dt>
        <dd class="mt-1 text-xl font-medium text-white">{{ stat.value }}</dd>
      </div>
    </dl>

    <div class="flex items-center justify-between">
      <UiButton variant="ghost" @click="router.push('/onboarding')">Add another account</UiButton>
      <UiButton @click="finish">Go to Clients</UiButton>
    </div>
  </OnboardingShell>
</template>