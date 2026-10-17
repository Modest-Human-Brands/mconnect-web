<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'success' | 'accent' }>(), { tone: 'neutral' })
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium whitespace-nowrap"
    :class="
      tone === 'success'
        ? 'bg-success-surface text-success-400'
        : tone === 'accent'
          ? 'bg-primary/20 text-primary-400'
          : 'bg-overlay text-body'
    "
  >
    <slot />
  </span>
</template>