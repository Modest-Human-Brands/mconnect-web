<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BrandMark from '@/components/ui/BrandMark.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { initialsOf, timeAgo } from '@/domain/crm'
import { useCrmStore } from '@/stores/crm'

const route = useRoute()
const router = useRouter()
const crm = useCrmStore()

const query = ref('')
const open = ref(false)
const root = ref<HTMLElement | null>(null)
onClickOutside(root, () => (open.value = false))

const section = computed(() => (route.path.startsWith('/clients') ? 'clients' : 'inbox'))

const term = computed(() => query.value.trim().toLowerCase())
const clientHits = computed(() =>
  term.value
    ? crm.contacts
        .filter((c) =>
          `${c.company ?? ''} ${c.name} ${c.email ?? ''}`.toLowerCase().includes(term.value),
        )
        .slice(0, 3)
    : [],
)
const mailHits = computed(() =>
  term.value
    ? crm.messages
        .filter((m) =>
          `${m.senderName} ${m.subject} ${m.preview}`.toLowerCase().includes(term.value),
        )
        .slice(0, 4)
    : [],
)

function openSearch() {
  open.value = true
  void crm.loadContacts()
  void crm.loadMessages()
}

async function go(path: string) {
  open.value = false
  query.value = ''
  await router.push(path)
}
</script>

<template>
  <header class="flex h-17 shrink-0 items-center justify-between gap-6 px-8">
    <RouterLink to="/" class="shrink-0 outline-none focus-visible:shadow-focus-ring">
      <BrandMark />
    </RouterLink>

    <div class="flex min-w-0 flex-1 items-center justify-center gap-8">
      <div ref="root" class="relative w-80 max-w-full">
        <input
          v-model="query"
          type="search"
          placeholder="Search clients, deals, emails"
          aria-label="Search clients, deals, emails"
          class="h-9 w-full rounded-md border bg-raised px-3 text-sm text-white outline-none placeholder:text-muted"
          :class="open && term ? 'border-primary-400' : 'border-line'"
          @focus="openSearch"
          @input="open = true"
          @keydown.esc="open = false"
        />
        <div
          v-if="open && term"
          class="absolute top-11 left-0 z-20 w-120 max-w-[90vw] overflow-hidden rounded-lg border border-line bg-raised p-2 shadow-popover"
        >
          <p
            v-if="!clientHits.length && !mailHits.length"
            class="px-3 py-4 text-sm text-muted"
            role="status"
          >
            Nothing matches "{{ query }}".
          </p>
          <template v-if="clientHits.length">
            <p class="eyebrow px-3 pt-2 pb-1 text-2xs">Clients</p>
            <button
              v-for="client in clientHits"
              :key="client.id"
              type="button"
              class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-overlay"
              @click="go('/clients')"
            >
              <UiAvatar :label="initialsOf(client.company || client.name)" size="sm" />
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate text-sm font-medium text-white">
                  {{ client.company || client.name }}
                </span>
                <span class="truncate text-xs text-muted">{{ client.email ?? client.name }}</span>
              </span>
              <span class="text-xs text-muted">{{ client.status }}</span>
            </button>
          </template>
          <template v-if="mailHits.length">
            <p class="eyebrow px-3 pt-2 pb-1 text-2xs">Emails</p>
            <button
              v-for="item in mailHits"
              :key="item.id"
              type="button"
              class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-overlay"
              @click="go(`/inbox/${item.id}`)"
            >
              <UiAvatar :label="initialsOf(item.senderName)" size="sm" />
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate text-sm font-medium text-white">{{ item.senderName }}</span>
                <span class="truncate text-xs text-muted">{{ item.subject }}</span>
              </span>
              <span class="text-xs text-muted">{{ timeAgo(item.date) }}</span>
            </button>
          </template>
        </div>
      </div>

      <nav class="flex items-center gap-5 text-sm" aria-label="Main">
        <RouterLink
          to="/inbox"
          class="outline-none focus-visible:shadow-focus-ring"
          :class="section === 'inbox' ? 'font-medium text-white' : 'text-muted hover:text-white'"
        >
          Inbox
        </RouterLink>
        <RouterLink
          to="/clients"
          class="outline-none focus-visible:shadow-focus-ring"
          :class="section === 'clients' ? 'font-medium text-white' : 'text-muted hover:text-white'"
        >
          Clients
        </RouterLink>
      </nav>
    </div>

    <div class="flex shrink-0 items-center gap-3">
      <template v-if="section === 'clients'">
        <UiButton variant="secondary" @click="router.push('/clients/new/source')">Import</UiButton>
        <UiButton @click="router.push('/clients/new/source')">New client</UiButton>
      </template>
      <template v-else>
        <UiButton variant="secondary" @click="router.push('/clients/new/source')">
          New client
        </UiButton>
        <UiButton @click="router.push('/email/new/template')">New email</UiButton>
      </template>
    </div>
  </header>
</template>