<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import type { EmailMessage } from '@/api/types'
import EmailFrame from '@/components/email/EmailFrame.vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiChip from '@/components/ui/UiChip.vue'
import { initialsOf, stageOf, timeAgo } from '@/domain/crm'
import { useCrmStore } from '@/stores/crm'
import IconEye from '~icons/lucide/eye'
import IconLink from '~icons/lucide/link'
import IconMail from '~icons/lucide/mail'
import IconPhone from '~icons/lucide/phone'
import IconVideo from '~icons/lucide/video'

const crm = useCrmStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  void crm.loadMessages()
  void crm.loadContacts()
})

// Only email is exposed by the API, so Meet and Calls stay empty until those channels exist.
const FILTERS = [
  { key: 'all', label: 'All', icon: null },
  { key: 'mail', label: 'Mail', icon: IconMail },
  { key: 'meet', label: 'Meet', icon: IconVideo },
  { key: 'call', label: 'Calls', icon: IconPhone },
] as const
const filter = ref<(typeof FILTERS)[number]['key']>('all')

const items = computed(() =>
  filter.value === 'all' || filter.value === 'mail' ? crm.messages : [],
)

const selected = computed<EmailMessage | undefined>(
  () => crm.messages.find((m) => m.id === route.params.id) ?? items.value[0],
)

const contact = computed(() =>
  selected.value
    ? crm.contacts.find(
        (c) => c.email && c.email.toLowerCase() === selected.value?.senderEmail.toLowerCase(),
      )
    : undefined,
)

const stats = computed(() => (selected.value ? crm.telemetry[selected.value.id] : undefined))

watch(
  () => selected.value?.id,
  (id) => {
    if (id) void crm.loadTelemetry(id)
  },
  { immediate: true },
)

const ICONS = { open: IconEye, click: IconLink, trap: IconLink } as const

function download(message: EmailMessage) {
  const url = URL.createObjectURL(new Blob([message.contentHtml], { type: 'text/html' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${message.subject || 'email'}.html`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col bg-canvas">
    <AppTopBar />

    <div class="grid min-h-0 flex-1 grid-cols-[21rem_minmax(0,1fr)_17.5rem] px-4">
      <section class="no-scrollbar flex min-h-0 flex-col overflow-y-auto border-r border-overlay">
        <div class="flex flex-col gap-3 px-6 pt-5 pb-3">
          <h1 class="text-lg font-medium text-white">Inbox</h1>
          <div class="flex flex-wrap gap-2" role="group" aria-label="Filter inbox">
            <button
              v-for="f in FILTERS"
              :key="f.key"
              type="button"
              class="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium outline-none focus-visible:shadow-focus-ring"
              :class="
                filter === f.key
                  ? 'border-white bg-white text-canvas'
                  : 'border-line text-white hover:bg-raised'
              "
              :aria-pressed="filter === f.key"
              @click="filter = f.key"
            >
              <component :is="f.icon" v-if="f.icon" class="size-3.5" aria-hidden="true" />
              {{ f.label }}
            </button>
          </div>
        </div>

        <p v-if="crm.messagesError" class="px-6 py-4 text-sm text-alert-400" role="alert">
          {{ crm.messagesError }}
          <UiButton variant="ghost" size="sm" @click="crm.loadMessages(true)">Retry</UiButton>
        </p>
        <p
          v-else-if="crm.messagesLoading && !crm.messagesLoaded"
          class="px-6 py-4 text-sm text-muted"
          role="status"
        >
          Loading inbox…
        </p>

        <ul>
          <li v-for="item in items" :key="item.id">
            <RouterLink
              :to="`/inbox/${item.id}`"
              class="flex gap-3 border-b border-overlay px-4 py-3 outline-none focus-visible:shadow-focus-ring"
              :class="selected?.id === item.id ? 'bg-raised' : 'hover:bg-raised/60'"
            >
              <img
                v-if="item.avatarUrl"
                :src="item.avatarUrl"
                alt=""
                class="size-8 shrink-0 rounded-full object-cover"
              />
              <UiAvatar v-else :label="initialsOf(item.senderName)[0] ?? '?'" size="md" />
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="flex items-baseline justify-between gap-2">
                  <span class="truncate text-sm font-medium text-white">{{ item.senderName }}</span>
                  <span class="shrink-0 text-xs text-muted">{{ timeAgo(item.date) }}</span>
                </span>
                <span class="truncate text-xs text-body">{{ item.subject }}</span>
                <span class="truncate text-xs text-muted">{{ item.preview }}</span>
              </span>
              <UiChip class="self-center">Mail</UiChip>
            </RouterLink>
          </li>
        </ul>
        <p
          v-if="!items.length && (crm.messagesLoaded || filter === 'meet' || filter === 'call')"
          class="px-6 py-8 text-sm text-muted"
        >
          {{
            filter === 'meet' || filter === 'call'
              ? 'Meetings and calls are not synced yet.'
              : 'Nothing here yet.'
          }}
        </p>
      </section>

      <section
        v-if="selected"
        class="no-scrollbar flex min-h-0 flex-col gap-4 overflow-y-auto px-8 py-5"
      >
        <header class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <UiAvatar :label="initialsOf(selected.senderName)[0] ?? '?'" size="md" />
            <div>
              <p class="text-sm font-medium text-white">{{ selected.senderName }}</p>
              <p class="text-xs text-muted">{{ selected.senderEmail }}</p>
            </div>
          </div>
          <p class="text-xs text-muted">{{ timeAgo(selected.date) }}</p>
        </header>

        <div class="flex flex-wrap gap-2">
          <UiButton variant="secondary" size="sm" @click="router.push('/email/new/template')">
            Reply
          </UiButton>
          <UiButton variant="secondary" size="sm" @click="router.push('/meeting/new/type')">
            Start meeting
          </UiButton>
          <UiButton variant="secondary" size="sm" @click="router.push('/clients')">
            View in Clients
          </UiButton>
          <UiButton variant="secondary" size="sm" @click="download(selected)">
            Download HTML
          </UiButton>
        </div>

        <EmailFrame :html="selected.contentHtml" class="h-180" />
      </section>

      <aside
        v-if="selected"
        class="no-scrollbar flex min-h-0 flex-col gap-4 overflow-y-auto py-5 pl-2"
        aria-label="Client details"
      >
        <p class="flex items-center gap-2 text-xs text-muted">
          <span>{{ timeAgo(selected.date) }}</span>
          <span v-if="selected.isVerified" class="text-success-400">✓ Verified sender</span>
        </p>

        <div class="flex flex-col gap-3 rounded-lg border border-line bg-raised p-4">
          <div class="flex items-center gap-3">
            <UiAvatar :label="initialsOf(selected.senderName)" size="md" />
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-white">{{ selected.senderName }}</p>
              <p class="truncate text-xs text-muted">{{ selected.senderEmail }}</p>
            </div>
          </div>
          <div v-if="contact" class="flex flex-wrap gap-2">
            <UiChip v-if="stageOf(contact.status) === 'Won'" tone="success">Won</UiChip>
            <UiChip>{{ contact.status }}</UiChip>
          </div>
        </div>

        <dl v-if="contact" class="flex flex-col gap-1 rounded-lg bg-overlay p-4 text-sm">
          <dt class="text-xs text-muted">Last contact</dt>
          <dd class="text-white">{{ timeAgo(contact.lastActive) }}</dd>
        </dl>

        <div
          v-if="stats"
          class="flex flex-col items-center gap-3 rounded-lg bg-overlay p-4 text-center"
        >
          <div class="grid w-full grid-cols-2 divide-x divide-line">
            <div>
              <p class="text-xs text-muted">Total opens</p>
              <p class="text-xl font-medium text-white">{{ stats.aggregated.totalOpens }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">Total clicks</p>
              <p
                class="text-xl font-medium"
                :class="stats.aggregated.totalClicks ? 'text-success-400' : 'text-white'"
              >
                {{ stats.aggregated.totalClicks }}
              </p>
            </div>
          </div>
          <p class="text-xs text-muted">
            Desktop {{ stats.aggregated.deviceBreakdown.desktop ?? 0 }} · Mobile
            {{ stats.aggregated.deviceBreakdown.mobile ?? 0 }}
            <template v-if="stats.aggregated.botFiltered">
              ({{ stats.aggregated.botFiltered }} bot filtered)
            </template>
          </p>
        </div>

        <section v-if="stats?.timeline.length" aria-label="Activity" class="flex flex-col gap-3">
          <h2 class="flex items-baseline justify-between text-lg font-medium text-white">
            Activity
            <span class="text-xs font-normal text-muted">{{ stats.timeline.length }}</span>
          </h2>
          <ul class="flex flex-col gap-3">
            <li v-for="event in stats.timeline" :key="event.id" class="flex items-center gap-3">
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-full bg-overlay text-white"
              >
                <component :is="ICONS[event.type]" class="size-4" aria-hidden="true" />
              </span>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="text-sm font-medium text-white">{{ event.title }}</span>
                <span class="truncate text-xs text-muted">{{ event.description }}</span>
              </span>
              <span class="shrink-0 text-xs text-muted">{{ timeAgo(event.timestamp) }}</span>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>