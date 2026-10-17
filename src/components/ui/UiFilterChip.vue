<script setup lang="ts">
defineProps<{ active?: boolean }>()
</script>

<template>
  <button
    type="button"
    class="inline-flex h-8 items-center gap-1.5 rounded-sm border px-3 text-xs font-medium transition-colors outline-none focus-visible:shadow-focus-ring"
    :class="
      active
        ? 'border-white bg-white text-canvas'
        : 'border-line bg-transparent text-white hover:bg-raised'
    "
    :aria-pressed="active"
  >
    <slot />
  </button>
</template>