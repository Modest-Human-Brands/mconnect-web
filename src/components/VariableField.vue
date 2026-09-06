<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  nodeKey: string
  modelValue: unknown
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
}>()

const isObject = computed(() => {
  return (
    props.modelValue !== null &&
    typeof props.modelValue === 'object' &&
    !Array.isArray(props.modelValue)
  )
})

const isArray = computed(() => {
  return Array.isArray(props.modelValue)
})

function updateNested(key: string, val: unknown): void {
  const currentObj =
    props.modelValue && typeof props.modelValue === 'object' && !Array.isArray(props.modelValue)
      ? (props.modelValue as Record<string, unknown>)
      : {}

  emit('update:modelValue', {
    ...currentObj,
    [key]: val,
  })
}

function updateArray(e: Event): void {
  const target = e.target as HTMLTextAreaElement
  try {
    emit('update:modelValue', JSON.parse(target.value) as unknown)
  } catch {
    // Retain invalid string while editing until JSON becomes valid
  }
}

function formatLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
}
</script>

<template>
  <div
    v-if="isObject"
    class="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3.5"
  >
    <label class="block text-xs font-bold uppercase tracking-wider text-amber-500">
      {{ formatLabel(nodeKey) }}
    </label>
    <div class="space-y-3 border-l-2 border-neutral-800 pl-3">
      <VariableField
        v-for="(val, subKey) in modelValue as Record<string, unknown>"
        :key="subKey"
        :node-key="String(subKey)"
        :model-value="val"
        @update:model-value="updateNested(String(subKey), $event)"
      />
    </div>
  </div>

  <div v-else-if="isArray" class="space-y-1">
    <label :for="nodeKey" class="block text-xs font-medium text-neutral-400">
      {{ formatLabel(nodeKey) }} (JSON Array)
    </label>
    <textarea
      :id="nodeKey"
      rows="4"
      class="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2.5 font-mono text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
      :value="JSON.stringify(modelValue, null, 2)"
      @input="updateArray"
    />
  </div>

  <div v-else class="space-y-1">
    <label :for="nodeKey" class="block text-xs font-medium text-neutral-400">
      {{ formatLabel(nodeKey) }}
    </label>

    <textarea
      v-if="
        nodeKey.toLowerCase().includes('message') || nodeKey.toLowerCase().includes('description')
      "
      :id="nodeKey"
      rows="3"
      class="w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
      :value="String(modelValue ?? '')"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <input
      v-else
      :id="nodeKey"
      type="text"
      class="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
      :value="String(modelValue ?? '')"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>