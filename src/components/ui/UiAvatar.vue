<script setup lang="ts">
withDefaults(defineProps<{ label: string; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full bg-overlay font-medium text-white"
    :class="size === 'sm' ? 'size-6 text-xs' : size === 'lg' ? 'size-10 text-sm' : 'size-8 text-xs'"
    aria-hidden="true"
  >
    {{ label }}
  </span>
</template>