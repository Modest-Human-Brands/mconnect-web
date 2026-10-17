<script setup lang="ts">
import BrandMark from '@/components/ui/BrandMark.vue'

defineProps<{ step: number; title: string; subtitle: string }>()
</script>

<template>
  <div class="flex min-h-full flex-col bg-canvas">
    <header class="px-8 py-6"><BrandMark /></header>

    <main class="mx-auto flex w-full max-w-160 flex-1 flex-col gap-5 px-6 pt-12 pb-16">
      <div class="flex flex-col gap-3">
        <p class="eyebrow">Step {{ step }} of 3</p>
        <h1 class="text-2xl font-medium tracking-tight text-white">{{ title }}</h1>
        <p class="text-sm text-muted">{{ subtitle }}</p>
      </div>
      <slot />
    </main>
  </div>
</template>