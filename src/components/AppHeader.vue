<script setup lang="ts">
import { useCycleList, useIntervalFn } from '@vueuse/core'

defineProps<{
  activePane: 'controls' | 'preview' | 'variables'
  activeTemplateName?: string
}>()

defineEmits<{
  (e: 'toggle-pane', pane: 'controls' | 'preview' | 'variables'): void
}>()

const features = [
  {
    highlight: 'Want email tracking & automated pipelines?',
    subtitle: 'Unlock full studio workflows.',
  },
  {
    highlight: 'Need custom dynamic variables & branding?',
    subtitle: 'Standardize brand-wide outreach.',
  },
  {
    highlight: 'Direct copy to Gmail & Outlook?',
    subtitle: 'Zero formatting glitches.',
  },
  {
    highlight: 'Real-time responsive previews?',
    subtitle: 'Desktop, tablet & mobile ready.',
  },
]

const { state: activeFeature, next } = useCycleList(features)

// Advance to the next feature highlight every 4 seconds
useIntervalFn(() => {
  next()
}, 4000)
</script>

<template>
  <header
    class="flex h-14 items-center justify-between border-b border-dark-600 bg-black px-4 lg:px-6"
  >
    <!-- Left: Brand + Active Template Indicator -->
    <div class="flex items-center gap-3 shrink-0">
      <span class="font-sub text-lg font-bold tracking-tight text-white">MConnect</span>
      <span class="h-4 w-px bg-dark-600" />
      <span class="text-base font-medium text-light-500">{{
        activeTemplateName || 'Outreach'
      }}</span>
    </div>

    <!-- Center: Feature Callout Banner with Rotating Animation -->
    <div
      class="hidden h-8 items-center gap-2 overflow-hidden rounded-full border border-accent-500 bg-dark-500/70 px-4 text-sm text-light-500 lg:flex"
    >
      <Transition name="fade-slide" mode="out-in">
        <div :key="activeFeature.highlight" class="flex items-center gap-1.5 whitespace-nowrap">
          <span class="font-medium text-white">{{ activeFeature.highlight }}</span>
          <span class="text-light-400">{{ activeFeature.subtitle }}</span>
        </div>
      </Transition>
    </div>

    <!-- Right: Mobile Navigation & CTA -->
    <div class="flex items-center gap-3 shrink-0">
      <!-- Mobile view segmented tabs -->
      <div class="flex rounded-lg border border-dark-600 bg-dark-500 p-0.5 lg:hidden">
        <button
          type="button"
          class="rounded px-2.5 py-1 text-sm transition-colors"
          :class="activePane === 'controls' ? 'bg-dark-600 text-white' : 'text-light-500'"
          @click="$emit('toggle-pane', 'controls')"
        >
          Setup
        </button>
        <button
          type="button"
          class="rounded px-2.5 py-1 text-sm transition-colors"
          :class="activePane === 'preview' ? 'bg-dark-600 text-white' : 'text-light-500'"
          @click="$emit('toggle-pane', 'preview')"
        >
          Preview
        </button>
        <button
          type="button"
          class="rounded px-2.5 py-1 text-sm transition-colors"
          :class="activePane === 'variables' ? 'bg-dark-600 text-white' : 'text-light-500'"
          @click="$emit('toggle-pane', 'variables')"
        >
          Variables
        </button>
      </div>

      <!-- Join Modest Human Brands CTA -->
      <a
        href="https://modesthumanbrands.com"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 rounded-md bg-accent-500 px-3.5 py-1.5 text-base font-medium text-white transition-colors hover:bg-accent-400"
      >
        <span>Join Modest Human Brands</span>
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </header>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>