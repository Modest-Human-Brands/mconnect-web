<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import InviteCard from '@/components/meeting/InviteCard.vue'
import WizardShell from '@/components/layout/WizardShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiField from '@/components/ui/UiField.vue'
import { formatRange, inviteBody } from '@/domain/meeting'
import { MEETING_STEPS, MEETING_TYPES, useMeetingWizardStore } from '@/stores/meetingWizard'

const router = useRouter()
const wizard = useMeetingWizardStore()
const form = wizard.form

const type = computed(() => MEETING_TYPES.find((t) => t.id === wizard.typeId))
const title = computed(() => type.value?.title ?? 'Meeting')
const range = computed(() => formatRange(form.date, form.time, form.duration))
const valid = computed(() => Boolean(form.date && form.time && form.guestEmail))
</script>

<template>
  <WizardShell
    :steps="MEETING_STEPS"
    :step="1"
    :title="`${title} details`"
    subtitle="Fields fill the invite as you type."
    :preview-label="`Live preview · ${title}`"
    exit-to="/inbox"
    :on-cancel="wizard.reset"
  >
    <section class="flex flex-col gap-3">
      <h2 class="text-xs text-muted">Meeting</h2>
      <div class="grid grid-cols-3 gap-3">
        <UiField v-model="form.ref" label="Meeting ref" suffix="Auto" readonly />
        <UiField v-model="form.date" label="Date" type="date" />
        <UiField v-model="form.time" label="Time" type="time" :badge="`${form.duration} min`" />
        <UiField v-model="form.deal" label="Linked deal" class="col-span-2" />
        <UiField
          :model-value="form.duration"
          label="Duration"
          type="number"
          suffix="min"
          @update:model-value="form.duration = Number($event) || 0"
        />
      </div>
      <p class="text-xs text-muted">{{ range }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-xs text-muted">Agenda</h2>
      <div class="grid grid-cols-3 gap-3">
        <UiField v-model="form.topic" label="Topic" class="col-span-2" />
        <UiField v-model="form.recording" label="Recording" :options="['Off', 'On']" />
        <UiField v-model="form.location" label="Location" class="col-span-3" />
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-xs text-muted">Guests</h2>
      <div class="grid grid-cols-2 gap-3">
        <UiField v-model="form.guestName" label="Guest" />
        <UiField v-model="form.guestEmail" label="Email" type="email" />
      </div>
    </section>

    <template #note>Draft saved just now</template>
    <template #actions>
      <UiButton variant="ghost" @click="router.push(MEETING_STEPS[0].path)">Back</UiButton>
      <UiButton :disabled="!valid" @click="router.push(MEETING_STEPS[2].path)">Review</UiButton>
    </template>
    <template #preview>
      <InviteCard :body="inviteBody(form, type)" />
    </template>
  </WizardShell>
</template>