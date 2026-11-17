<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { verifyAccess } from '@/api/accounts'
import BrandMark from '@/components/ui/BrandMark.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiField from '@/components/ui/UiField.vue'
import { config, saveAccess } from '@/config'

const router = useRouter()

const organizationId = ref(config.organizationId)
const userId = ref(config.userId)
const apiKey = ref(config.apiKey)
const errors = ref<{ organizationId?: string; userId?: string; apiKey?: string }>({})
const failure = ref('')
const busy = ref(false)

async function submit() {
  failure.value = ''
  errors.value = {
    organizationId: organizationId.value.trim() ? undefined : 'Enter your organization ID.',
    userId: userId.value.trim() ? undefined : 'Enter your user ID.',
    apiKey: apiKey.value.trim() ? undefined : 'Enter your API key.',
  }
  if (errors.value.organizationId || errors.value.userId || errors.value.apiKey) return

  busy.value = true
  try {
    await verifyAccess({
      organizationId: organizationId.value.trim(),
      userId: userId.value.trim(),
      apiKey: apiKey.value.trim(),
    })
    saveAccess({
      organizationId: organizationId.value,
      userId: userId.value,
      apiKey: apiKey.value,
    })
    await router.push('/')
  } catch (err) {
    failure.value = err instanceof Error ? err.message : 'Could not verify these details.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full items-center justify-center bg-canvas px-4 py-10">
    <form
      class="flex w-full max-w-112 flex-col gap-5 rounded-xl bg-raised p-6"
      novalidate
      @submit.prevent="submit"
    >
      <BrandMark />
      <h1 class="text-xl text-white">Connect to MConnect</h1>
      <p class="text-sm text-muted">
        The organization scopes your clients and inbox. The API key grants access. Details stay in
        this browser.
      </p>

      <UiField
        v-model="organizationId"
        label="Organization ID"
        placeholder="modest-human-brands"
        autocomplete="organization"
        outlined
        :error="errors.organizationId"
      />
      <UiField
        v-model="userId"
        label="User ID"
        placeholder="Your user id"
        autocomplete="off"
        outlined
        :error="errors.userId"
      />
      <UiField
        v-model="apiKey"
        label="API key"
        type="password"
        placeholder="••••••••••••"
        autocomplete="off"
        outlined
        :error="errors.apiKey"
      />

      <p v-if="failure" class="text-sm text-alert-400" role="alert">{{ failure }}</p>

      <UiButton type="submit" class="w-full" :disabled="busy">
        {{ busy ? 'Checking…' : 'Continue' }}
      </UiButton>
    </form>
  </div>
</template>