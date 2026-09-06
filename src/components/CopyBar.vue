<script setup lang="ts">
defineEmits<{
  (e: 'copy-rich'): void
  (e: 'view-preview'): void
}>()
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-dark-600 bg-black/95 px-4 py-3 backdrop-blur lg:hidden"
  >
    <button
      type="button"
      class="text-xs text-light-500 underline underline-offset-2"
      @click="$emit('view-preview')"
    >
      View preview
    </button>
    <button
      type="button"
      class="rounded-md bg-accent-500 px-4 py-2 text-xs font-semi-bold text-white"
      @click="$emit('copy-rich')"
    >
      Copy for email
    </button>
  </div>
</template>