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
  email: string
}>()
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-91.5 flex-col gap-4 rounded-xl border border-line bg-raised p-5"
  >
    <div class="flex items-center gap-3">
      <UiAvatar :label="initialsOf(company || 'New client')" size="md" />
      <div class="min-w-0">
        <p class="truncate text-sm font-medium text-white">{{ company || 'New client' }}</p>
        <p class="truncate text-xs text-muted">
          {{ contact || 'Contact' }}{{ city ? ` · ${city}` : '' }}
        </p>
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <UiChip>{{ stage }}</UiChip>
      <UiChip v-if="project">{{ project }}</UiChip>
    </div>
    <p class="eyebrow text-2xs">Contact</p>
    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 rounded-lg border border-line p-3 text-xs">
      <dt class="text-muted">Company</dt>
      <dd class="truncate text-white">{{ company || '-' }}</dd>
      <dt class="text-muted">Contact</dt>
      <dd class="truncate text-white">{{ contact || '-' }}</dd>
      <dt class="text-muted">Email</dt>
      <dd class="truncate text-white">{{ email || '-' }}</dd>
      <dt class="text-muted">Stage</dt>
      <dd class="text-white">{{ stage }}</dd>
    </dl>
    <dl class="flex flex-col gap-2 rounded-lg bg-overlay p-4 text-sm">
      <dt class="text-xs text-muted">Last contact</dt>
      <dd class="text-white">Not contacted yet</dd>
    </dl>
  </div>
</template>