<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { EmailProvider } from '@/api/accounts'
import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiChip from '@/components/ui/UiChip.vue'
import { useAccountsStore } from '@/stores/accounts'
import { useCrmStore } from '@/stores/crm'

const PROVIDERS: { key: EmailProvider; initial: string; title: string; description: string }[] = [
  {
    key: 'google',
    initial: 'G',
    title: 'Google Workspace',
    description: 'Gmail and shared mailboxes',
  },
  { key: 'microsoft', initial: 'M', title: 'Microsoft 365', description: 'Outlook and Exchange' },
  {
    key: 'imap',
    initial: 'I',
    title: 'Other email (IMAP)',
    description: 'Any provider with IMAP and SMTP',
  },
]

const router = useRouter()
const route = useRoute()
const accounts = useAccountsStore()
const crm = useCrmStore()

// The OAuth callback reports failures as ?emailError=<message>.
const callbackError = typeof route.query.emailError === 'string' ? route.query.emailError : ''

onMounted(() => void accounts.load())

function connect(provider: EmailProvider) {
  if (provider === 'imap') return router.push('/onboarding/email')
  return accounts.connectOAuth(provider, '/onboarding/done')
}

async function next() {
  if (accounts.accounts.length) return router.push('/onboarding/done')
  return skip()
}

async function skip() {
  crm.finishOnboarding()
  await router.push('/clients')
}
</script>

<template>
  <OnboardingShell
    :step="1"
    title="Connect your accounts"
    subtitle="Bring in your email, call history and meetings so every client conversation lives in one timeline."
  >
    <p
      v-if="accounts.loadError"
      class="rounded-md border border-line bg-raised p-3 text-xs text-muted"
    >
      Account connections are unavailable right now ({{ accounts.loadError }}). You can skip this
      step and connect later.
    </p>
    <p v-if="callbackError || accounts.error" class="text-sm text-alert-400" role="alert">
      {{ callbackError || accounts.error }}
    </p>

    <section class="flex flex-col gap-3" aria-labelledby="email-heading">
      <h2 id="email-heading" class="eyebrow">Email</h2>
      <div
        v-for="item in PROVIDERS"
        :key="item.key"
        class="flex items-center gap-3 rounded-lg border border-line bg-raised p-4"
      >
        <UiAvatar :label="item.initial" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-white">{{ item.title }}</p>
          <p class="truncate text-xs text-muted">
            {{ accounts.forProvider(item.key)?.address ?? item.description }}
          </p>
        </div>
        <UiChip>{{ accounts.forProvider(item.key) ? 'Connected' : 'Not connected' }}</UiChip>
        <UiButton
          v-if="accounts.forProvider(item.key)"
          variant="secondary"
          :disabled="accounts.busy"
          @click="accounts.remove(accounts.forProvider(item.key)!.id)"
        >
          Disconnect
        </UiButton>
        <UiButton
          v-else
          variant="secondary"
          :disabled="accounts.busy || Boolean(accounts.loadError)"
          @click="connect(item.key)"
        >
          Connect
        </UiButton>
      </div>
    </section>

    <section class="flex flex-col gap-3" aria-labelledby="calls-heading">
      <h2 id="calls-heading" class="eyebrow">Calls and meetings</h2>
      <div class="flex items-center gap-3 rounded-lg border border-line bg-raised p-4">
        <UiAvatar label="C" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-white">Call history</p>
          <p class="text-xs text-muted">
            Import a call log file. Calling from MConnect comes later.
          </p>
        </div>
        <UiChip>Not set up</UiChip>
        <UiButton variant="secondary" disabled>Import</UiButton>
      </div>
      <div class="flex items-center gap-3 rounded-lg border border-line bg-raised p-4">
        <UiAvatar label="V" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-white">Web meetings</p>
          <p class="text-xs text-muted">Video and voice rooms built in, no extra app</p>
        </div>
        <UiChip>Enabled</UiChip>
      </div>
    </section>

    <div class="flex items-center justify-between">
      <UiButton variant="ghost" @click="skip">Skip for now</UiButton>
      <UiButton @click="next">Continue</UiButton>
    </div>
  </OnboardingShell>
</template>