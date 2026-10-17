<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import InviteCard from '@/components/meeting/InviteCard.vue'
import WizardShell from '@/components/layout/WizardShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiFilterChip from '@/components/ui/UiFilterChip.vue'
import { inviteBody } from '@/domain/meeting'
import { MEETING_STEPS, MEETING_TYPES, useMeetingWizardStore } from '@/stores/meetingWizard'
import IconCheck from '~icons/lucide/check'
import IconPlus from '~icons/lucide/plus'

const router = useRouter()
const wizard = useMeetingWizardStore()

const filter = ref<string | null>(null)
const categories = computed(() => {
  const counts = new Map<string, number>()
  for (const t of MEETING_TYPES) counts.set(t.category, (counts.get(t.category) ?? 0) + 1)
  return [...counts].map(([name, count]) => ({ name, count }))
})
const visible = computed(() =>
  filter.value ? MEETING_TYPES.filter((t) => t.category === filter.value) : MEETING_TYPES,
)
const selected = computed(() => MEETING_TYPES.find((t) => t.id === wizard.typeId))
</script>

<template>
  <WizardShell
    :steps="MEETING_STEPS"
    :step="0"
    title="Choose a meeting type"
    subtitle="Pick one to preview the invite. You can switch any time before filling details."
    :preview-label="`Preview · ${selected?.title ?? 'Blank meeting'} · sample`"
    exit-to="/inbox"
    :on-cancel="wizard.reset"
  >
    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter meeting types">
      <UiFilterChip :active="filter === null" @click="filter = null">
        All {{ MEETING_TYPES.length }}
      </UiFilterChip>
      <UiFilterChip
        v-for="c in categories"
        :key="c.name"
        :active="filter === c.name"
        @click="filter = c.name"
      >
        {{ c.name }} {{ c.count }}
      </UiFilterChip>
    </div>

    <ul class="grid grid-cols-3 gap-3">
      <li v-for="t in visible" :key="t.id">
        <button
          type="button"
          class="relative flex h-full w-full flex-col gap-1 rounded-lg border bg-raised p-4 text-left outline-none focus-visible:shadow-focus-ring"
          :class="
            wizard.typeId === t.id ? 'border-primary-400' : 'border-overlay hover:border-line'
          "
          :aria-pressed="wizard.typeId === t.id"
          @click="wizard.selectType(t.id)"
        >
          <span
            v-if="wizard.typeId === t.id"
            class="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-white"
          >
            <IconCheck class="size-3 [--icon-stroke:3]" aria-hidden="true" />
            <span class="sr-only">Selected</span>
          </span>
          <span class="text-sm font-medium text-white">{{ t.title }}</span>
          <span class="text-xs text-muted">{{ t.category }}, {{ t.minutes }} min</span>
        </button>
      </li>
      <li>
        <button
          type="button"
          class="flex h-full min-h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-3 text-center outline-none focus-visible:shadow-focus-ring"
          :class="wizard.typeId === null ? 'border-primary-400' : 'border-line'"
          :aria-pressed="wizard.typeId === null"
          @click="wizard.selectType(null)"
        >
          <IconPlus class="size-5 text-white" aria-hidden="true" />
          <span class="text-sm font-medium text-white">Blank meeting</span>
          <span class="text-xs text-muted">No type, just a room</span>
        </button>
      </li>
    </ul>

    <template #note>
      {{ selected ? `${selected.title} selected` : 'Blank meeting selected' }}
    </template>
    <template #actions>
      <UiButton @click="router.push(MEETING_STEPS[1].path)">Continue</UiButton>
    </template>
    <template #preview>
      <InviteCard :body="inviteBody(wizard.form, selected)" />
    </template>
  </WizardShell>
</template>