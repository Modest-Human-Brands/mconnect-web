<script setup lang="ts">
import { ref } from 'vue'
import SectionHeader from './SectionHeader.vue'
import ImageDropzone from './ImageDropzone.vue'

interface OrganizationData {
  id?: string
  name: string
  legalName: string
  entityType: string
  tradeRelationship?: string
  gstin: string
  pan: string
  address?: string
  foundedYear?: number
  website?: string
  phone?: string
  contactEmail: string
  billingEmail?: string
  whatsapp?: string
  colorPrimary?: string
  colorAccent?: string
  logoDataUrl?: string
  accountDetails?: {
    accountName: string
    accountNumber: string | number
    bankName: string
    ifscCode: string
  }
  [key: string]: unknown
}

const props = defineProps<{
  brand: OrganizationData
}>()

const isOpen = ref(true)
const showAdvanced = ref(false)

const fieldClass =
  'w-full rounded-md border border-dark-600 bg-dark-500 px-3 py-2 text-base text-white placeholder:text-light-400 focus:border-accent-500 focus:outline-none'
</script>

<template>
  <section>
    <SectionHeader title="Organization Details" v-model:open="isOpen">
      <template #icon>
        <svg
          class="size-4 text-light-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M8 10h.01" />
          <path d="M16 10h.01" />
          <path d="M8 14h.01" />
          <path d="M16 14h.01" />
        </svg>
      </template>
    </SectionHeader>

    <div v-show="isOpen" class="mt-4 space-y-3.5">
      <!-- Organization Name -->
      <div>
        <label for="org-name" class="mb-1 flex items-center gap-1.5 text-base text-light-500">
          <svg
            class="size-3 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 2v4" />
            <path d="m4.93 4.93 2.83 2.83" />
            <path d="M2 12h4" />
            <path d="m4.93 19.07 2.83-2.83" />
            <path d="M12 22v-4" />
            <path d="m19.07 19.07-2.83-2.83" />
            <path d="M22 12h-4" />
            <path d="m19.07 4.93-2.83 2.83" />
          </svg>
          Organization Name *
        </label>
        <input
          id="org-name"
          v-model="brand.name"
          type="text"
          placeholder="Modest Human Brands"
          :class="fieldClass"
        />
      </div>

      <!-- Legal Name -->
      <div>
        <label for="legal-name" class="mb-1 flex items-center gap-1.5 text-base text-light-500">
          <svg
            class="size-3 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Legal Name *
        </label>
        <input
          id="legal-name"
          v-model="brand.legalName"
          type="text"
          placeholder="Modest Human Brands Pvt. Ltd."
          :class="fieldClass"
        />
      </div>

      <!-- Entity Type -->
      <div>
        <label for="entity-type" class="mb-1 flex items-center gap-1.5 text-base text-light-500">
          <svg
            class="size-3 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Entity Type *
        </label>
        <select id="entity-type" v-model="brand.entityType" :class="fieldClass">
          <option value="Private Limited Company">Private Limited Company</option>
          <option value="Limited Liability Partnership">Limited Liability Partnership</option>
          <option value="Sole Proprietorship">Sole Proprietorship</option>
          <option value="Corporation">Corporation</option>
        </select>
      </div>

      <!-- GSTIN -->
      <div>
        <label for="gstin" class="mb-1 flex items-center gap-1.5 text-base text-light-500">
          <svg
            class="size-3 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 7h10" />
            <path d="M7 12h10" />
            <path d="M7 17h10" />
          </svg>
          GSTIN *
        </label>
        <input
          id="gstin"
          v-model="brand.gstin"
          type="text"
          placeholder="27AAHCM1234F1Z5"
          :class="fieldClass"
        />
      </div>

      <!-- PAN -->
      <div>
        <label for="pan" class="mb-1 flex items-center gap-1.5 text-base text-light-500">
          <svg
            class="size-3 text-light-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
          PAN *
        </label>
        <input
          id="pan"
          v-model="brand.pan"
          type="text"
          placeholder="AAHCM1234F"
          :class="fieldClass"
        />
      </div>

      <!-- Expandable More Details Button -->
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-md border border-dark-600 bg-dark-500/50 px-3 py-2 text-base text-light-500 transition-colors hover:text-white"
        @click="showAdvanced = !showAdvanced"
      >
        <span>Brand Assets &amp; Contact</span>
        <svg
          class="size-3.5 transition-transform duration-150"
          :class="{ 'rotate-180': showAdvanced }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <!-- Advanced / Branding section -->
      <div
        v-show="showAdvanced"
        class="space-y-3 rounded-lg border border-dark-600/60 bg-dark-500/30 p-3"
      >
        <div>
          <label class="mb-1 block text-sm text-light-400">Organization Logo</label>
          <ImageDropzone v-model="brand.logoDataUrl" />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="mb-1 block text-sm text-light-400">Primary Color</label>
            <div
              class="flex items-center gap-2 rounded border border-dark-600 bg-dark-500 px-2 py-1"
            >
              <input
                v-model="brand.colorPrimary"
                type="color"
                class="size-5 cursor-pointer bg-transparent"
              />
              <span class="font-mono text-sm text-light-500">{{
                brand.colorPrimary || '#000000'
              }}</span>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm text-light-400">Accent Color</label>
            <div
              class="flex items-center gap-2 rounded border border-dark-600 bg-dark-500 px-2 py-1"
            >
              <input
                v-model="brand.colorAccent"
                type="color"
                class="size-5 cursor-pointer bg-transparent"
              />
              <span class="font-mono text-sm text-light-500">{{
                brand.colorAccent || '#6672FF'
              }}</span>
            </div>
          </div>
        </div>

        <div>
          <label for="contact-email" class="mb-1 block text-sm text-light-400">Contact Email</label>
          <input
            id="contact-email"
            v-model="brand.contactEmail"
            type="email"
            placeholder="contact@modesthuman.com"
            :class="fieldClass"
          />
        </div>

        <div>
          <label for="address" class="mb-1 block text-sm text-light-400">Address</label>
          <textarea
            id="address"
            v-model="brand.address"
            rows="2"
            placeholder="Registered office address"
            class="w-full resize-none rounded-md border border-dark-600 bg-dark-500 px-3 py-2 text-base text-white placeholder:text-light-400 focus:border-accent-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  </section>
</template>