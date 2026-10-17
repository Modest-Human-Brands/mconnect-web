<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AppTopBar from '@/components/layout/AppTopBar.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { STAGES, boardStats, initialsOf, stageOf, timeAgo } from '@/domain/crm'
import { useCrmStore } from '@/stores/crm'

const crm = useCrmStore()
onMounted(() => void crm.loadContacts())

const VIEWS = ['Board', 'List'] as const
const view = ref<(typeof VIEWS)[number]>('Board')

const columns = computed(() => STAGES.map((stage) => ({ stage, items: crm.byStage(stage) })))
const stats = computed(() => boardStats(crm.contacts))
const subtitle = computed(() => {
  const open = crm.contacts.filter((c) => {
    const stage = stageOf(c.status)
    return stage !== null && stage !== 'Won'
  }).length
  return `${crm.contacts.length} clients, ${open} open deals`
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col bg-canvas">
    <AppTopBar />

    <main class="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-8">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-lg font-medium text-white">Clients</h1>
          <p class="text-xs text-muted">{{ subtitle }}</p>
        </div>
        <div class="flex items-center gap-4 pt-1 text-sm" role="tablist" aria-label="Clients view">
          <button
            v-for="name in VIEWS"
            :key="name"
            type="button"
            role="tab"
            :aria-selected="view === name"
            class="outline-none focus-visible:shadow-focus-ring"
            :class="view === name ? 'font-medium text-white' : 'text-muted hover:text-white'"
            @click="view = name"
          >
            {{ name }}
          </button>
        </div>
      </div>

      <dl class="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-lg border border-line bg-raised p-4"
        >
          <dt class="text-xs text-muted">{{ stat.label }}</dt>
          <dd class="mt-1 text-xl font-medium text-white">{{ stat.value }}</dd>
        </div>
      </dl>

      <p v-if="crm.contactsError" class="mt-6 text-sm text-alert-400" role="alert">
        {{ crm.contactsError }}
        <UiButton variant="ghost" size="sm" @click="crm.loadContacts(true)">Retry</UiButton>
      </p>
      <p
        v-else-if="crm.contactsLoading && !crm.contactsLoaded"
        class="mt-6 text-sm text-muted"
        role="status"
      >
        Loading clients…
      </p>
      <p v-else-if="!crm.contacts.length" class="mt-6 text-sm text-muted">
        No clients yet. Use “New client” to add the first one.
      </p>

      <div
        v-else-if="view === 'Board'"
        class="mt-5 grid grid-cols-[repeat(5,minmax(15rem,1fr))] gap-4 overflow-x-auto"
      >
        <section v-for="column in columns" :key="column.stage" :aria-label="column.stage">
          <header class="mb-3 flex items-baseline justify-between text-sm">
            <h2 class="font-medium text-white">{{ column.stage }}</h2>
            <span class="text-xs text-muted">{{ column.items.length }}</span>
          </header>
          <ul class="flex flex-col gap-3">
            <li
              v-for="client in column.items"
              :key="client.id"
              class="flex flex-col gap-2 rounded-lg border border-line bg-raised p-3"
            >
              <p class="truncate text-sm font-medium text-white">
                {{ client.company || client.name }}
              </p>
              <p class="truncate text-xs text-muted">
                {{ client.jobTitle ? `${client.name}, ${client.jobTitle}` : client.name }}
              </p>
              <div class="flex items-center justify-between gap-2 pt-1">
                <span class="truncate rounded-full bg-overlay px-3 py-0.5 text-xs text-body">
                  {{
                    client.unreadCount ? `${client.unreadCount} unread` : timeAgo(client.lastActive)
                  }}
                </span>
                <UiAvatar :label="initialsOf(client.name)" />
              </div>
            </li>
          </ul>
        </section>
      </div>

      <table v-else class="mt-5 w-full text-left text-sm">
        <thead class="text-xs text-muted">
          <tr>
            <th class="pb-2 font-normal">Client</th>
            <th class="pb-2 font-normal">Contact</th>
            <th class="pb-2 font-normal">Status</th>
            <th class="pb-2 font-normal">Last active</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in crm.contacts" :key="client.id" class="border-t border-overlay">
            <td class="py-3 font-medium text-white">{{ client.company || client.name }}</td>
            <td class="py-3 text-body">{{ client.email ?? client.phone ?? client.name }}</td>
            <td class="py-3 text-muted">{{ client.status }}</td>
            <td class="py-3 text-muted">{{ timeAgo(client.lastActive) }}</td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>