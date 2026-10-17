<script setup lang="ts">
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiChip from '@/components/ui/UiChip.vue'
import { initialsOf } from '@/domain/crm'

defineProps<{
  company: string
  contact: string
  city: string
  stage: string
  project: string
}>()

// The API has no deal value, owner or follow-up data yet, so those show placeholders.
const EMPTY = '-'
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-93 flex-col gap-4 rounded-xl border border-line bg-raised p-6"
  >
    <div class="flex items-center gap-3">
      <UiAvatar :label="initialsOf(company || 'New client')" size="lg" />
      <div class="min-w-0">
        <p class="truncate text-base font-medium text-white">{{ company || 'New client' }}</p>
        <p class="truncate text-xs text-muted">
          {{ [contact, city].filter(Boolean).join(' · ') || 'Contact' }}
        </p>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <UiChip>{{ stage }}</UiChip>
      <UiChip v-if="project">{{ project }}</UiChip>
    </div>

    <hr class="h-px border-0 bg-overlay" />

    <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
      <div>
        <dt class="text-xs text-muted">Project</dt>
        <dd class="truncate text-white">{{ project || EMPTY }}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted">Stage</dt>
        <dd class="text-white">{{ stage }}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted">Value</dt>
        <dd class="text-white">{{ EMPTY }}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted">Owner</dt>
        <dd class="text-white">{{ EMPTY }}</dd>
      </div>
    </dl>

    <dl class="grid grid-cols-2 gap-3 text-sm">
      <div class="rounded-lg bg-overlay p-3">
        <dt class="text-xs text-muted">Last contact</dt>
        <dd class="text-white">Not contacted yet</dd>
      </div>
      <div class="rounded-lg bg-overlay p-3">
        <dt class="text-xs text-muted">Next step</dt>
        <dd class="text-white">Send intro email</dd>
      </div>
    </dl>
  </div>
</template>