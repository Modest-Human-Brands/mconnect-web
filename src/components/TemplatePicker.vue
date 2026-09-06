<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TemplateListItem } from '../types/email.ts'
import SectionHeader from './SectionHeader.vue'

const props = defineProps<{
  templates: TemplateListItem[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const isOpen = ref(true)
const activeCategory = ref('All')

const categories = computed(() => {
  const uniqueCategories = new Set(
    props.templates.map((t) => t.category?.trim()).filter((cat): cat is string => Boolean(cat)),
  )
  return ['All', ...Array.from(uniqueCategories)]
})

const visibleTemplates = computed(() => {
  if (activeCategory.value === 'All') return props.templates
  return props.templates.filter(
    (t) => t.category?.toLowerCase() === activeCategory.value.toLowerCase(),
  )
})

const FALLBACK_THUMB =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><rect width="160" height="100" fill="%23222224"/></svg>'
</script>

<template>
  <section class="border-b border-dark-600 pb-5">
    <SectionHeader title="Templates" v-model:open="isOpen">
      <template #icon>
        <svg
          class="size-4 text-light-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      </template>
    </SectionHeader>

    <div v-show="isOpen" class="mt-3 space-y-3 scrollbar-none">
      <!-- Category Pill Filters -->
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="rounded-md px-2.5 py-1 text-sm transition-colors"
          :class="
            activeCategory === cat
              ? 'bg-dark-500 text-white font-medium'
              : 'text-light-400 hover:text-white'
          "
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Template Cards Grid -->
      <ul class="grid grid-cols-2 gap-2.5" role="listbox">
        <li v-for="t in visibleTemplates" :key="t.id">
          <button
            type="button"
            role="option"
            :aria-selected="t.id === selectedId"
            class="group flex w-full flex-col overflow-hidden rounded-lg border text-left transition-all"
            :class="
              t.id === selectedId
                ? 'border-accent-500 ring-1 ring-accent-500'
                : 'border-dark-600 bg-dark-500 hover:border-dark-500'
            "
            @click="emit('select', t.id)"
          >
            <div class="h-20 w-full overflow-hidden bg-dark-400">
              <img
                :src="t.thumbnail || FALLBACK_THUMB"
                alt=""
                class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <span
              class="w-full truncate px-2.5 py-2 text-base font-medium"
              :class="t.id === selectedId ? 'text-white' : 'text-light-500 group-hover:text-white'"
            >
              {{ t.label }}
            </span>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>