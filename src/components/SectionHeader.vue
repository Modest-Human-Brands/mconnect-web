<script setup lang="ts">
import IconChevronDown from './icons/IconChevronDown.vue'

defineProps<{ title: string }>()

const isOpen = defineModel<boolean>('open', { default: true })
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center justify-between text-left"
    :aria-expanded="isOpen"
    @click="isOpen = !isOpen"
  >
    <span class="flex items-center gap-2">
      <slot name="icon" />
      <h2 class="font-sub text-lg font-semi-bold text-white">{{ title }}</h2>
    </span>
    <IconChevronDown
      class="size-4 shrink-0 text-light-500 transition-transform duration-150"
      :class="{ '-rotate-180': !isOpen }"
    />
  </button>
</template>