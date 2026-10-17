<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  html: string
  loading?: boolean
  error?: string
}>()

const HIDE_SCROLLBARS =
  '<style>html,body{scrollbar-width:none!important}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none!important}</style>'

const srcdoc = computed(() =>
  props.html.includes('</head>')
    ? props.html.replace('</head>', `${HIDE_SCROLLBARS}</head>`)
    : `${HIDE_SCROLLBARS}${props.html}`,
)
</script>

<template>
  <div
    class="relative mx-auto h-full min-h-120 w-full max-w-150 overflow-hidden rounded-xs border-t-2 border-t-primary/60 bg-white"
  >
    <iframe
      v-if="html"
      title="Email preview"
      class="h-full w-full bg-white"
      sandbox=""
      :srcdoc="srcdoc"
    />
    <p
      v-else-if="error"
      class="flex h-full items-center justify-center px-8 text-center text-sm text-alert-500"
      role="alert"
    >
      {{ error }}
    </p>
    <p v-else class="flex h-full items-center justify-center text-sm text-subtle" role="status">
      Select a template to preview it here.
    </p>
    <span
      v-if="loading && html"
      class="absolute top-2 right-2 rounded-full bg-canvas/80 px-2 py-0.5 text-2xs text-white"
      role="status"
    >
      Updating…
    </span>
  </div>
</template>