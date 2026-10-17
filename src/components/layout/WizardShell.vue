<script setup lang="ts">
import { useRouter } from 'vue-router'

import BrandMark from '@/components/ui/BrandMark.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiStepper from '@/components/ui/UiStepper.vue'

const props = defineProps<{
  steps: readonly { label: string; path: string }[]
  /** Zero-based index of the current step. */
  step: number
  title: string
  subtitle: string
  previewLabel: string
  /** Where Cancel returns to. */
  exitTo: string
  /** Runs before leaving through Cancel, e.g. to drop the draft. */
  onCancel?: () => void
}>()

const router = useRouter()

async function cancel() {
  props.onCancel?.()
  await router.push(props.exitTo)
}
</script>

<template>
  <div class="flex h-full min-h-0 gap-3 bg-canvas p-3">
    <section class="flex w-1/2 max-w-160 min-w-0 shrink-0 flex-col gap-6 px-8 py-6">
      <header class="flex items-center justify-between">
        <BrandMark />
        <div class="flex items-center gap-3">
          <UiButton variant="pill" size="sm">Save draft</UiButton>
          <button
            type="button"
            class="text-sm text-muted outline-none hover:text-white focus-visible:shadow-focus-ring"
            @click="cancel"
          >
            Cancel
          </button>
        </div>
      </header>

      <UiStepper :steps="steps.map((s) => s.label)" :current="step" />

      <div class="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-medium tracking-tight text-white">{{ title }}</h1>
          <p class="text-sm text-muted">{{ subtitle }}</p>
        </div>
        <slot />
      </div>

      <footer class="flex flex-col gap-4">
        <hr class="h-px border-0 bg-overlay" />
        <div class="flex min-h-9 items-center justify-between gap-4">
          <p class="text-xs text-muted" role="status"><slot name="note" /></p>
          <div class="flex items-center gap-2"><slot name="actions" /></div>
        </div>
      </footer>
    </section>

    <aside class="flex min-w-0 flex-1 flex-col gap-3 px-6 py-6" aria-label="Preview">
      <p class="text-sm font-medium text-muted">{{ previewLabel }}</p>
      <div class="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto *:my-auto">
        <slot name="preview" />
      </div>
    </aside>
  </div>
</template>