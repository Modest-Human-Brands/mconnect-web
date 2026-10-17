<script setup lang="ts">
withDefaults(defineProps<{ size?: 'md' | 'lg'; name?: string }>(), {
  size: 'md',
  name: 'MConnect',
})
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <span
      class="flex items-center justify-center rounded-sm bg-white font-medium text-canvas"
      :class="size === 'lg' ? 'size-8 text-base' : 'size-6 text-xs'"
      aria-hidden="true"
    >
      M
    </span>
    <span class="font-medium text-white" :class="size === 'lg' ? 'text-base' : 'text-base'">
      {{ name }}
    </span>
  </span>
</template>