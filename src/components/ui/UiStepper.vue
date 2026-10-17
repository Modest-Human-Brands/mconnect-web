<script setup lang="ts">
defineProps<{
  steps: readonly string[]
  /** Zero-based index of the current step. */
  current: number
}>()
</script>

<template>
  <ol class="flex gap-3">
    <li v-for="(label, index) in steps" :key="label" class="flex flex-1 flex-col gap-2">
      <span
        class="h-0.5 rounded-full"
        :class="index <= current ? 'bg-primary' : 'bg-line'"
        aria-hidden="true"
      />
      <span
        class="text-xs"
        :class="index === current ? 'font-medium text-white' : 'text-muted'"
        :aria-current="index === current ? 'step' : undefined"
      >
        {{ index < current ? '✓ ' : `${index + 1} ` }}{{ label }}
      </span>
    </li>
  </ol>
</template>