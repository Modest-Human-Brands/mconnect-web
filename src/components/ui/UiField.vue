<script setup lang="ts">
import { useId } from 'vue'

import IconChevronDown from '~icons/lucide/chevron-down'

const model = defineModel<string | number>({ default: '' })

withDefaults(
  defineProps<{
    label: string
    placeholder?: string
    suffix?: string
    badge?: string
    readonly?: boolean
    multiline?: boolean
    rows?: number
    type?: 'text' | 'email' | 'tel' | 'date' | 'time' | 'number'
    options?: readonly string[]
    error?: string
  }>(),
  { type: 'text', rows: 4 },
)

const id = useId()
</script>

<template>
  <div class="flex min-w-0 flex-col gap-1.5">
    <label :for="id" class="text-sm font-medium text-body">{{ label }}</label>
    <div
      class="relative flex items-center gap-2 rounded-md border px-3 transition-shadow"
      :class="[
        multiline ? 'items-start py-2.5' : 'h-9.5',
        error
          ? 'border-alert-500 bg-raised'
          : readonly
            ? 'border-line bg-transparent'
            : 'border-transparent bg-raised focus-within:border-primary-400 focus-within:shadow-focus-ring',
      ]"
    >
      <select
        v-if="options"
        :id="id"
        v-model="model"
        class="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-6 text-sm text-white outline-none"
      >
        <option v-for="option in options" :key="option" :value="option" class="bg-raised">
          {{ option }}
        </option>
      </select>
      <IconChevronDown
        v-if="options"
        class="pointer-events-none absolute right-3 size-4 text-muted"
        aria-hidden="true"
      />
      <textarea
        v-else-if="multiline"
        :id="id"
        v-model="model"
        :rows="rows"
        :placeholder="placeholder"
        :readonly="readonly"
        class="min-w-0 flex-1 resize-y bg-transparent text-sm text-white outline-none placeholder:text-muted"
      />
      <input
        v-else
        :id="id"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :readonly="readonly"
        :aria-invalid="error ? true : undefined"
        class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        :class="readonly ? 'text-muted' : 'text-white'"
      />
      <span v-if="suffix" class="shrink-0 text-xs text-muted">{{ suffix }}</span>
      <span
        v-if="badge"
        class="shrink-0 rounded-xs bg-overlay px-2 py-0.5 text-xs font-medium text-body"
      >
        {{ badge }}
      </span>
    </div>
    <p v-if="error" class="text-xs text-alert-400" role="alert">{{ error }}</p>
  </div>
</template>