<script setup lang="ts">
import { computed, ref } from 'vue'

export interface VariableFieldItem {
  path: string
  label: string
  type?: string
  options?: Array<{ label: string; value: unknown }>
}

const props = withDefaults(
  defineProps<{
    fields?: VariableFieldItem[]
    formData?: Record<string, unknown>
    placeholders?: Record<string, unknown>
  }>(),
  {
    fields: () => [],
    formData: () => ({}),
    placeholders: () => ({}),
  },
)

const showAllVariables = ref(false)
const copiedToken = ref<string | null>(null)

const visibleFieldList = computed(() => {
  if (!props.fields.length) return []
  if (showAllVariables.value) return props.fields
  return props.fields.slice(0, 11)
})

async function copyToken(tokenKey: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(`{{${tokenKey}}}`)
    copiedToken.value = tokenKey
    setTimeout(() => {
      if (copiedToken.value === tokenKey) copiedToken.value = null
    }, 1500)
  } catch {
    // Clipboard unavailable fallback
  }
}

const inputClass =
  'w-full rounded-md border border-dark-600 bg-dark-500 px-3 py-2.5 text-base text-white placeholder:text-light-400 focus:border-accent-500 focus:outline-none'
</script>

<template>
  <section class="space-y-4">
    <!-- Panel Header -->
    <div class="border-b border-dark-600 pb-3">
      <div class="flex items-center gap-2">
        <svg class="size-5 text-warning-400" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <h2 class="font-sub text-lg font-semibold text-white">Dynamic Variables</h2>
      </div>
      <p class="mt-1.5 text-sm text-light-400">These values will be injected into your template.</p>
    </div>

    <!-- Variable Fields List -->
    <div class="space-y-4">
      <div v-for="field in visibleFieldList" :key="field.path" class="space-y-1.5">
        <label :for="field.path" class="flex items-center gap-2 text-base text-light-500">
          <!-- Recipient / Name Icon -->
          <svg
            v-if="
              field.path.toLowerCase().includes('name') ||
              field.path.toLowerCase().includes('recipient')
            "
            class="size-4 shrink-0 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>

          <!-- Email / Subject Icon -->
          <svg
            v-else-if="
              field.path.toLowerCase().includes('mail') ||
              field.path.toLowerCase().includes('subject')
            "
            class="size-4 shrink-0 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>

          <!-- Headline / Typography Icon -->
          <svg
            v-else-if="
              field.path.toLowerCase().includes('headline') ||
              field.path.toLowerCase().includes('title')
            "
            class="size-4 shrink-0 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" x2="15" y1="20" y2="20" />
            <line x1="12" x2="12" y1="4" y2="20" />
          </svg>

          <!-- Image / Logo Icon -->
          <svg
            v-else-if="
              field.path.toLowerCase().includes('image') ||
              field.path.toLowerCase().includes('logo')
            "
            class="size-4 shrink-0 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>

          <!-- Message / Description Icon -->
          <svg
            v-else-if="
              field.path.toLowerCase().includes('message') ||
              field.path.toLowerCase().includes('description')
            "
            class="size-4 shrink-0 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
          </svg>

          <!-- CTA / Click Icon -->
          <svg
            v-else-if="
              field.path.toLowerCase().includes('cta') ||
              field.path.toLowerCase().includes('button')
            "
            class="size-4 shrink-0 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>

          <!-- Category / Tag Icon -->
          <svg
            v-else-if="
              field.path.toLowerCase().includes('category') ||
              field.path.toLowerCase().includes('tag')
            "
            class="size-4 shrink-0 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"
            />
            <path d="M7 7h.01" />
          </svg>

          <!-- URL / Link Icon -->
          <svg
            v-else-if="
              field.path.toLowerCase().includes('url') || field.path.toLowerCase().includes('link')
            "
            class="size-4 shrink-0 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>

          <!-- Default Generic Text Icon -->
          <svg
            v-else
            class="size-4 shrink-0 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" x2="15" y1="20" y2="20" />
            <line x1="12" x2="12" y1="4" y2="20" />
          </svg>

          <span>{{ field.label }}</span>
        </label>

        <!-- Dropdown for Enum Fields -->
        <div v-if="field.type === 'enum' && field.options" class="relative">
          <select
            :id="field.path"
            v-model="formData[field.path]"
            :class="inputClass"
            class="cursor-pointer pr-10"
          >
            <option value="" disabled>Select option…</option>
            <option v-for="opt in field.options" :key="String(opt.value)" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-light-400">
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <!-- Textarea for Multi-line Pitch / Descriptions -->
        <div
          v-else-if="
            field.path.toLowerCase().includes('message') ||
            field.path.toLowerCase().includes('description')
          "
          class="relative flex"
        >
          <textarea
            :id="field.path"
            v-model="formData[field.path] as string"
            rows="2"
            :placeholder="
              placeholders[field.path]
                ? 'e.g. ' + String(placeholders[field.path])
                : 'e.g. ' + field.label
            "
            :class="inputClass"
            class="resize-none pr-10"
          />
          <button
            type="button"
            class="absolute right-3 top-2.5 font-mono text-base transition-colors"
            :class="
              copiedToken === field.path ? 'text-success-400' : 'text-light-400 hover:text-white'
            "
            :title="
              copiedToken === field.path
                ? 'Copied {{' + field.path + '}}'
                : 'Copy {{' + field.path + '}} token'
            "
            @click="copyToken(field.path)"
          >
            {{ copiedToken === field.path ? '✓' : '{}' }}
          </button>
        </div>

        <!-- Standard Single-line Input -->
        <div v-else class="relative flex items-center">
          <input
            :id="field.path"
            v-model="formData[field.path] as string"
            type="text"
            :placeholder="
              placeholders[field.path]
                ? 'e.g. ' + String(placeholders[field.path])
                : 'e.g. ' + field.label
            "
            :class="inputClass"
            class="pr-10"
          />
          <button
            type="button"
            class="absolute right-3 font-mono text-base transition-colors"
            :class="
              copiedToken === field.path ? 'text-success-400' : 'text-light-400 hover:text-white'
            "
            :title="
              copiedToken === field.path
                ? 'Copied {{' + field.path + '}}'
                : 'Copy {{' + field.path + '}} token'
            "
            @click="copyToken(field.path)"
          >
            {{ copiedToken === field.path ? '✓' : '{}' }}
          </button>
        </div>
      </div>

      <!-- Expand / Collapse More Variables -->
      <button
        v-if="fields.length > 11"
        type="button"
        class="mt-4 flex w-full items-center justify-between rounded-md border border-dark-600 bg-dark-500 px-3.5 py-2.5 text-base font-medium text-light-500 transition-colors hover:text-white"
        @click="showAllVariables = !showAllVariables"
      >
        <span>{{ showAllVariables ? 'Show Fewer Variables' : 'More Variables' }}</span>
        <svg
          class="size-4 transition-transform duration-200"
          :class="{ 'rotate-90': !showAllVariables, '-rotate-90': showAllVariables }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  </section>
</template>