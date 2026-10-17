<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiField from '@/components/ui/UiField.vue'
import { useAccountsStore } from '@/stores/accounts'

type Provider = 'google' | 'microsoft' | 'imap'

const TABS: { key: Provider; label: string }[] = [
  { key: 'google', label: 'Google Workspace' },
  { key: 'microsoft', label: 'Microsoft 365' },
  { key: 'imap', label: 'Other (IMAP)' },
]

// The API picks the transport from the port, so the security choice sets a matching default port.
const SECURITY = ['SSL/TLS', 'STARTTLS'] as const
const DEFAULT_PORT = {
  imap: { 'SSL/TLS': 993, STARTTLS: 143 },
  smtp: { 'SSL/TLS': 465, STARTTLS: 587 },
} as const

type Security = (typeof SECURITY)[number]

const router = useRouter()
const accounts = useAccountsStore()

const tab = ref<Provider>('imap')
const form = reactive({
  imapHost: '',
  imapPort: 993,
  imapSecurity: 'SSL/TLS' as Security,
  smtpHost: '',
  smtpPort: 587,
  smtpSecurity: 'STARTTLS' as Security,
  user: '',
  pass: '',
})

watch(
  () => form.imapSecurity,
  (value, previous) => {
    if (form.imapPort === DEFAULT_PORT.imap[previous]) form.imapPort = DEFAULT_PORT.imap[value]
  },
)
watch(
  () => form.smtpSecurity,
  (value, previous) => {
    if (form.smtpPort === DEFAULT_PORT.smtp[previous]) form.smtpPort = DEFAULT_PORT.smtp[value]
  },
)

const valid = computed(() =>
  Boolean(form.imapHost.trim() && form.smtpHost.trim() && form.user.trim() && form.pass),
)

function asSecurity(value: string | number): Security {
  return value === 'STARTTLS' ? 'STARTTLS' : 'SSL/TLS'
}

async function submit() {
  const user = form.user.trim()
  const ok = await accounts.addImap({
    fromName: user.split('@')[0] || user,
    fromEmail: user,
    imapHost: form.imapHost.trim(),
    imapPort: form.imapPort,
    smtpHost: form.smtpHost.trim(),
    smtpPort: form.smtpPort,
    user,
    pass: form.pass,
  })
  if (ok) await router.push('/onboarding/done')
}
</script>

<template>
  <OnboardingShell
    :step="2"
    title="Set up your email"
    subtitle="Enter your mail server details. Google and Microsoft accounts use secure sign-in instead of a password."
  >
    <div class="flex flex-wrap gap-2" role="tablist" aria-label="Email provider">
      <button
        v-for="item in TABS"
        :key="item.key"
        type="button"
        role="tab"
        :aria-selected="tab === item.key"
        class="h-8 rounded-full border px-3 text-xs font-medium outline-none focus-visible:shadow-focus-ring"
        :class="
          tab === item.key
            ? 'border-white bg-white text-canvas'
            : 'border-line text-white hover:bg-raised'
        "
        @click="tab = item.key"
      >
        {{ item.label }}
      </button>
    </div>

    <template v-if="tab === 'imap'">
      <form class="flex flex-col gap-5" @submit.prevent="submit">
        <section class="flex flex-col gap-3">
          <h2 class="eyebrow">Incoming mail (IMAP)</h2>
          <div class="grid grid-cols-[1fr_6rem_10rem] gap-3">
            <UiField v-model="form.imapHost" label="IMAP server" placeholder="imap.example.com" />
            <UiField
              :model-value="form.imapPort"
              label="Port"
              type="number"
              @update:model-value="form.imapPort = Number($event)"
            />
            <UiField
              :model-value="form.imapSecurity"
              label="Security"
              :options="SECURITY"
              @update:model-value="form.imapSecurity = asSecurity($event)"
            />
          </div>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="eyebrow">Outgoing mail (SMTP)</h2>
          <div class="grid grid-cols-[1fr_6rem_10rem] gap-3">
            <UiField v-model="form.smtpHost" label="SMTP server" placeholder="smtp.example.com" />
            <UiField
              :model-value="form.smtpPort"
              label="Port"
              type="number"
              @update:model-value="form.smtpPort = Number($event)"
            />
            <UiField
              :model-value="form.smtpSecurity"
              label="Security"
              :options="SECURITY"
              @update:model-value="form.smtpSecurity = asSecurity($event)"
            />
          </div>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="eyebrow">Sign in</h2>
          <div class="grid grid-cols-2 gap-3">
            <UiField v-model="form.user" label="Username" placeholder="you@example.com" />
            <UiField v-model="form.pass" label="App password" type="password" />
          </div>
        </section>

        <p class="rounded-lg border border-dashed border-line p-4 text-xs text-muted">
          Credentials are stored encrypted and only used to sync mail. We test the connection before
          saving. Calls and meetings need no setup.
        </p>
        <p v-if="accounts.error" class="text-sm text-alert-400" role="alert">
          {{ accounts.error }}
        </p>

        <div class="flex items-center justify-between">
          <UiButton variant="ghost" @click="router.push('/onboarding')">Back</UiButton>
          <UiButton type="submit" :disabled="!valid || accounts.busy">
            {{ accounts.busy ? 'Testing…' : 'Test and connect' }}
          </UiButton>
        </div>
      </form>
    </template>

    <template v-else>
      <p class="rounded-lg border border-dashed border-line p-4 text-xs text-muted">
        You will sign in with {{ tab === 'google' ? 'Google' : 'Microsoft' }} and approve access to
        your mailbox. No password is shared with MConnect.
      </p>
      <p v-if="accounts.error" class="text-sm text-alert-400" role="alert">{{ accounts.error }}</p>
      <div class="flex items-center justify-between">
        <UiButton variant="ghost" @click="router.push('/onboarding')">Back</UiButton>
        <UiButton
          :disabled="accounts.busy"
          @click="accounts.connectOAuth(tab as 'google' | 'microsoft', '/onboarding/done')"
        >
          Continue with {{ tab === 'google' ? 'Google' : 'Microsoft' }}
        </UiButton>
      </div>
    </template>
  </OnboardingShell>
</template>