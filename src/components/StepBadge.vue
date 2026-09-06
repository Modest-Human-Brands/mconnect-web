<script setup lang="ts">
defineProps<{
  number: number | string
  title: string
}>()
</script>

<template>
  <div class="flex items-center gap-2.5">
    <span
      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-700 font-mono text-xs font-bold text-neutral-300"
    >
      {{ number }}
    </span>
    <h2 class="text-sm font-semibold text-neutral-100">{{ title }}</h2>
  </div>
</template>