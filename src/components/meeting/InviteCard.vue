<script setup lang="ts">
import type { InviteBody } from '@/domain/meeting'

defineProps<{ body: InviteBody }>()
</script>

<template>
  <article
    class="mx-auto w-full max-w-150 rounded-xs border-t-2 border-t-primary/60 bg-white px-8 py-8 text-canvas"
  >
    <header class="flex items-center gap-2">
      <span
        class="flex size-8 items-center justify-center rounded-sm bg-canvas text-xs font-medium text-white"
      >
        M
      </span>
      <span class="text-sm font-medium">Modest Human Brands</span>
    </header>
    <p class="mt-1 font-mono text-xs tracking-[0.12em] text-subtle">{{ body.tag }}</p>
    <h2 class="text-lg font-medium">{{ body.title }}</h2>
    <hr class="my-5 border-0 border-t border-body" />

    <div class="flex flex-col gap-2 text-sm">
      <p v-for="line in body.intro" :key="line">{{ line }}</p>
    </div>

    <dl class="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
      <template v-for="[label, value] in body.facts" :key="label">
        <dt class="text-subtle">{{ label }}</dt>
        <dd class="font-medium">{{ value }}</dd>
      </template>
    </dl>
  </article>
</template>