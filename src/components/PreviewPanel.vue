<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  contentHtml: string
  isRendering: boolean
  hasTemplate: boolean
}>()

const statusLabel = ref<string>('')
const viewportMode = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
const showSourceCode = ref(false)

const viewportWidthClass = {
  desktop: 'w-full max-w-[660px]',
  tablet: 'w-full max-w-[480px]',
  mobile: 'w-full max-w-[360px]',
}

const styledContentHtml = computed(() => {
  if (!props.contentHtml) return ''
  const hideScrollbarStyles = `
    <style>
      html, body {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      html::-webkit-scrollbar, body::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    </style>`
  if (props.contentHtml.includes('</head>')) {
    return props.contentHtml.replace('</head>', `${hideScrollbarStyles}</head>`)
  }
  return `${hideScrollbarStyles}${props.contentHtml}`
})

async function copyRich(): Promise<void> {
  if (!props.contentHtml) return
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      const plainText =
        new DOMParser().parseFromString(props.contentHtml, 'text/html').body.textContent || ''
      const item = new ClipboardItem({
        'text/html': new Blob([props.contentHtml], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      })
      await navigator.clipboard.write([item])
      flash('Email Copied!')
      return
    }
  } catch {}

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.contentHtml)
      flash('HTML markup copied to clipboard')
      return
    }
  } catch {}
}

async function copySource(): Promise<void> {
  if (!props.contentHtml) return
  await navigator.clipboard?.writeText(props.contentHtml)
  flash('Raw HTML source copied')
}

function flash(msg: string): void {
  statusLabel.value = msg
  setTimeout(() => {
    if (statusLabel.value === msg) statusLabel.value = ''
  }, 2500)
}

defineExpose({ copyRich, copySource })
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Preview Header Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-dark-600/80 pb-3">
      <div>
        <div class="flex items-center gap-2">
          <svg
            class="size-4 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <h2 class="font-sub text-lg font-semibold text-white">Email Preview</h2>
        </div>
        <p class="text-sm text-light-400">This is how your email will look to the recipient.</p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Bottom Actions Toolbar -->
        <span class="flex items-center gap-1.5 text-2xs text-light-500">
          <span
            class="size-2 rounded-full"
            :class="isRendering ? 'bg-warning-500 animate-pulse' : 'bg-success-500'"
          />
          {{ isRendering ? 'Syncing edits…' : 'Synced' }}
        </span>
        <!-- Viewport Switcher -->
        <div class="flex items-center rounded-md border border-dark-600 bg-dark-500 p-0.5">
          <button
            type="button"
            class="rounded p-1 text-light-400 transition-colors hover:text-white"
            :class="{ 'bg-dark-600 text-white': viewportMode === 'desktop' }"
            title="Desktop view"
            @click="viewportMode = 'desktop'"
          >
            <svg
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
          </button>
          <button
            type="button"
            class="rounded p-1 text-light-400 transition-colors hover:text-white"
            :class="{ 'bg-dark-600 text-white': viewportMode === 'tablet' }"
            title="Tablet view"
            @click="viewportMode = 'tablet'"
          >
            <svg
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect width="16" height="20" x="4" y="2" rx="2" />
              <line x1="12" x2="12.01" y1="18" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            class="rounded p-1 text-light-400 transition-colors hover:text-white"
            :class="{ 'bg-dark-600 text-white': viewportMode === 'mobile' }"
            title="Mobile view"
            @click="viewportMode = 'mobile'"
          >
            <svg
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect width="14" height="20" x="5" y="2" rx="2" />
              <line x1="12" x2="12.01" y1="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-md bg-accent-500 px-3.5 py-1.5 text-base font-medium text-white transition-colors hover:bg-accent-400 disabled:opacity-40"
            :disabled="!hasTemplate"
            @click="copyRich"
          >
            <p v-if="!statusLabel" role="status">Copy to Gmail / Outlook</p>
            <p v-else role="status">
              {{ statusLabel }}
            </p>
          </button>
        </div>
      </div>
    </div>

    <!-- Email Canvas -->
    <div class="relative mt-3 flex flex-1 items-start justify-center overflow-y-auto py-2">
      <!-- <div v-if="!hasTemplate"
        class="flex h-96 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dark-600 text-center"
        style="background-image: repeating-linear-gradient(115deg, #070707 0px, #070707 34px, #18181a 34px, #18181a 68px)">
        <p class="text-base text-light-500">Select a template from the left to preview</p>
      </div> -->
      <img
        src="/mono_dark_distortion_1.webp"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-0"
      />

      <div
        class="h-full py-4 transition-all duration-200 z-10"
        :class="viewportWidthClass[viewportMode]"
      >
        <div
          class="h-full overflow-hidden rounded-xl border border-dark-600 bg-white shadow-2xl transition-all"
        >
          <iframe
            title="Email Preview"
            class="h-full w-full bg-white scrollbar-none"
            sandbox=""
            :srcdoc="styledContentHtml"
          />
        </div>
      </div>
    </div>
  </div>
</template>