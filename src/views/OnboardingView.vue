<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  connectImap,
  disconnectAccount,
  listAccounts,
  startOAuth,
  type EmailAccount,
  type EmailProvider,
} from '@/api/accounts'
import BrandMark from '@/components/ui/BrandMark.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiChip from '@/components/ui/UiChip.vue'
import UiField from '@/components/ui/UiField.vue'
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
const crm = useCrmStore()

const accounts = ref<EmailAccount[]>([])
const loadError = ref('')
const busy = ref<string | null>(null)
// The OAuth callback reports failures as ?emailError=<message>.
const actionError = ref(typeof route.query.emailError === 'string' ? route.query.emailError : '')
const showImap = ref(false)

const imap = reactive({
  fromName: '',
  fromEmail: '',
  imapHost: '',
  imapPort: 993,
  smtpHost: '',
  smtpPort: 465,
  user: '',
  pass: '',
})
const imapValid = computed(() =>
  Boolean(imap.fromEmail && imap.imapHost && imap.smtpHost && imap.user && imap.pass),
)

function accountFor(provider: EmailProvider) {
  return accounts.value.find((a) => a.provider === provider)
}

async function refresh() {
  loadError.value = ''
  try {
    accounts.value = await listAccounts()
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Could not load accounts.'
  }
}

onMounted(refresh)

async function connect(provider: EmailProvider) {
  actionError.value = ''
  if (provider === 'imap') {
    showImap.value = !showImap.value
    return
  }
  busy.value = provider
  try {
    window.location.assign(await startOAuth(provider))
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : 'Could not start sign-in.'
    busy.value = null
  }
}

async function submitImap() {
  busy.value = 'imap'
  actionError.value = ''
  try {
    await connectImap({ ...imap })
    showImap.value = false
    await refresh()
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : 'Could not connect the mailbox.'
  } finally {
    busy.value = null
  }
}

async function disconnect(account: EmailAccount) {
  busy.value = account.id
  actionError.value = ''
  try {
    await disconnectAccount(account.id)
    await refresh()
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : 'Could not disconnect.'
  } finally {
    busy.value = null
  }
}

async function finish() {
  crm.finishOnboarding()
  await router.push('/clients')
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-canvas">
    <header class="px-8 py-6"><BrandMark /></header>

    <main class="mx-auto flex w-full max-w-160 flex-1 flex-col gap-5 px-6 pt-12 pb-16">
      <div class="flex flex-col gap-3">
        <p class="eyebrow">Step 1 of 3</p>
        <h1 class="text-2xl font-medium tracking-tight text-white">Connect your accounts</h1>
        <p class="text-sm text-muted">
          Bring in your email, call history and meetings so every client conversation lives in one
          timeline.
        </p>
      </div>

      <p v-if="loadError" class="rounded-md border border-line bg-raised p-3 text-xs text-muted">
        Account connections are unavailable right now ({{ loadError }}). You can skip this step and
        connect later.
      </p>
      <p v-if="actionError" class="text-sm text-alert-400" role="alert">{{ actionError }}</p>

      <section class="flex flex-col gap-3" aria-labelledby="email-heading">
        <h2 id="email-heading" class="eyebrow">Email</h2>
        <template v-for="item in PROVIDERS" :key="item.key">
          <div class="flex items-center gap-3 rounded-lg border border-line bg-raised p-4">
            <UiAvatar :label="item.initial" size="md" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-white">{{ item.title }}</p>
              <p class="truncate text-xs text-muted">
                {{ accountFor(item.key)?.address ?? item.description }}
              </p>
            </div>
            <UiChip :tone="accountFor(item.key) ? 'success' : 'neutral'">
              {{ accountFor(item.key) ? 'Connected' : 'Not connected' }}
            </UiChip>
            <UiButton
              v-if="accountFor(item.key)"
              variant="secondary"
              :disabled="busy !== null"
              @click="disconnect(accountFor(item.key)!)"
            >
              Disconnect
            </UiButton>
            <UiButton
              v-else
              variant="secondary"
              :disabled="busy !== null || Boolean(loadError)"
              @click="connect(item.key)"
            >
              {{ busy === item.key ? 'Connecting…' : 'Connect' }}
            </UiButton>
          </div>

          <form
            v-if="item.key === 'imap' && showImap"
            class="grid grid-cols-2 gap-3 rounded-lg border border-line bg-raised p-4"
            @submit.prevent="submitImap"
          >
            <UiField
              v-model="imap.fromName"
              label="Sender name"
              placeholder="Modest Human Brands"
            />
            <UiField v-model="imap.fromEmail" label="Sender email" type="email" />
            <UiField v-model="imap.imapHost" label="IMAP host" placeholder="imap.example.com" />
            <UiField
              :model-value="imap.imapPort"
              label="IMAP port"
              type="number"
              @update:model-value="imap.imapPort = Number($event)"
            />
            <UiField v-model="imap.smtpHost" label="SMTP host" placeholder="smtp.example.com" />
            <UiField
              :model-value="imap.smtpPort"
              label="SMTP port"
              type="number"
              @update:model-value="imap.smtpPort = Number($event)"
            />
            <UiField v-model="imap.user" label="Username" />
            <UiField v-model="imap.pass" label="Password" type="password" />
            <div class="col-span-2 flex justify-end gap-2">
              <UiButton variant="ghost" @click="showImap = false">Cancel</UiButton>
              <UiButton type="submit" :disabled="!imapValid || busy !== null">
                {{ busy === 'imap' ? 'Verifying…' : 'Verify and connect' }}
              </UiButton>
            </div>
          </form>
        </template>
      </section>

      <section class="flex flex-col gap-3" aria-labelledby="calls-heading">
        <h2 id="calls-heading" class="eyebrow">Calls and meetings</h2>
        <div class="flex items-center gap-3 rounded-lg border border-line bg-raised p-4">
          <UiAvatar label="C" size="md" />
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
          <UiAvatar label="V" size="md" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-white">Web meetings</p>
            <p class="text-xs text-muted">Video and voice rooms built in, no extra app</p>
          </div>
          <UiChip>Enabled</UiChip>
        </div>
      </section>

      <div class="flex items-center justify-between">
        <UiButton variant="ghost" @click="finish">Skip for now</UiButton>
        <UiButton @click="finish">Continue</UiButton>
      </div>
    </main>
  </div>
</template>