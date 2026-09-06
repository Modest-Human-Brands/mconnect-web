<script setup lang="ts">
import { ref } from 'vue'
import IconPlus from './icons/IconPlus.vue'
import IconGlobe from './icons/IconGlobe.vue'
import IconPaste from './icons/IconPaste.vue'
import IconRefresh from './icons/IconRefresh.vue'
import IconCamera from './icons/IconCamera.vue'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isDragging = ref(false)
const urlDraft = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function readFile(file: File): void {
  const reader = new FileReader()
  reader.onload = () =>
    emit('update:modelValue', typeof reader.result === 'string' ? reader.result : '')
  reader.readAsDataURL(file)
}

function handleDrop(event: DragEvent): void {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) readFile(file)
}

function handlePick(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) readFile(file)
  target.value = ''
}

async function pasteFromClipboard(): Promise<void> {
  try {
    const items = await navigator.clipboard.read()
    for (const item of items) {
      const imageType = item.types.find((t) => t.startsWith('image/'))
      if (imageType) {
        const blob = await item.getType(imageType)
        readFile(new File([blob], 'pasted-image', { type: imageType }))
        return
      }
    }
  } catch {
    // image clipboard read unsupported/denied — fall through to text
  }
  try {
    const text = await navigator.clipboard.readText()
    if (text) emit('update:modelValue', text.trim())
  } catch {
    // clipboard unavailable — user can still type the URL below
  }
}

function applyUrl(): void {
  const value = urlDraft.value.trim()
  if (!value) return
  emit('update:modelValue', value)
  urlDraft.value = ''
}

function clear(): void {
  emit('update:modelValue', '')
}
</script>

<template>
  <div>
    <!-- empty state: same diagonal placeholder treatment used when no
         template is selected — swap the background-image for the real
         asset once one is provided -->
    <div
      v-if="!modelValue"
      class="relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border px-6 py-10 text-center transition-colors"
      :class="isDragging ? 'border-accent-400' : 'border-dark-600'"
      style="
        background-image: repeating-linear-gradient(
          115deg,
          #050505 0px,
          #050505 34px,
          #1b1b1d 34px,
          #1b1b1d 68px
        );
      "
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="fileInput?.click()"
    >
      <IconPlus class="size-5 text-light-500" />
      <p class="text-xs text-light-500">Drag &amp; drop, click to browse, or paste</p>
      <span class="rounded border border-dark-600 px-1.5 py-0.5 text-2xs text-light-400"
        >⌘V to paste</span
      >
    </div>

    <div v-else class="flex items-center gap-3 rounded-xl border border-dark-600 bg-dark-500 p-3">
      <img
        :src="modelValue"
        alt=""
        class="h-10 w-10 shrink-0 rounded-lg bg-black/40 object-cover"
      />
      <span class="min-w-0 flex-1 truncate text-xs text-light-500">
        {{ modelValue.startsWith('data:') ? 'Uploaded image' : modelValue }}
      </span>
      <button type="button" class="shrink-0 text-xs text-light-400 hover:text-white" @click="clear">
        Remove
      </button>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handlePick" />

    <div class="my-2 flex items-center gap-2 text-2xs uppercase tracking-wider text-light-400">
      <span class="h-px flex-1 bg-dark-600" />
      or
      <span class="h-px flex-1 bg-dark-600" />
    </div>

    <div
      class="flex items-center gap-1.5 rounded-lg border border-dark-600 bg-dark-500 px-2 py-1.5"
    >
      <IconGlobe class="size-3.5 shrink-0 text-light-400" />
      <input
        v-model="urlDraft"
        type="text"
        placeholder="Enter website URL…"
        class="w-full min-w-0 bg-transparent text-xs text-white placeholder:text-light-400 focus:outline-none"
        @keydown.enter="applyUrl"
      />
      <button
        type="button"
        class="shrink-0 text-light-400 hover:text-white"
        title="Paste from clipboard"
        @click="pasteFromClipboard"
      >
        <IconPaste class="size-3.5" />
      </button>
      <button
        type="button"
        class="shrink-0 text-light-400 hover:text-white"
        title="Use this URL"
        @click="applyUrl"
      >
        <IconRefresh class="size-3.5" />
      </button>
      <button
        type="button"
        class="shrink-0 text-light-400 hover:text-white"
        title="Upload a photo"
        @click="fileInput?.click()"
      >
        <IconCamera class="size-3.5" />
      </button>
    </div>
  </div>
</template>