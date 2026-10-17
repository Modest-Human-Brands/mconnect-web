<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import InviteCard from '@/components/meeting/InviteCard.vue'
import WizardShell from '@/components/layout/WizardShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { formatWhen, inviteBody } from '@/domain/meeting'
import { MEETING_STEPS, MEETING_TYPES, useMeetingWizardStore } from '@/stores/meetingWizard'

const router = useRouter()
const wizard = useMeetingWizardStore()

const type = computed(() => MEETING_TYPES.find((t) => t.id === wizard.typeId))
const body = computed(() => inviteBody(wizard.form, type.value))

const copied = ref(false)

/** The API has no meetings endpoint yet, so the invite is handed over as text to send manually. */
async function copyInvite() {
  const lines = [
    body.value.title,
    '',
    ...body.value.intro,
    '',
    ...(body.value.facts ?? []).map(([label, value]) => `${label} ${value}`),
  ]
  try {
    await navigator.clipboard.writeText(lines.join('\n'))
    copied.value = true
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <WizardShell
    :steps="MEETING_STEPS"
    :step="2"
    title="Review the invite"
    subtitle="This is the invite your guest receives."
    preview-label="Final preview · Invite"
    exit-to="/inbox"
    :on-cancel="wizard.reset"
  >
    <dl
      class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg border border-line bg-raised p-4 text-sm"
    >
      <dt class="text-muted">Guest</dt>
      <dd class="text-white">{{ wizard.form.guestName }} · {{ wizard.form.guestEmail }}</dd>
      <dt class="text-muted">When</dt>
      <dd class="text-white">{{ formatWhen(wizard.form.date, wizard.form.time) }}</dd>
      <dt class="text-muted">Topic</dt>
      <dd class="text-white">{{ wizard.form.topic }}</dd>
    </dl>

    <template #note>
      {{
        copied
          ? 'Invite copied'
          : 'Meetings are not connected to the API yet, so send the invite yourself.'
      }}
    </template>
    <template #actions>
      <UiButton variant="ghost" @click="router.push(MEETING_STEPS[1].path)">Back</UiButton>
      <UiButton @click="copyInvite">Copy invite</UiButton>
    </template>
    <template #preview><InviteCard :body="body" /></template>
  </WizardShell>
</template>