<script setup lang="ts">
import { computed } from 'vue'

import UiButton from '@/components/ui/UiButton.vue'
import UiField from '@/components/ui/UiField.vue'
import { createEmptyArrayItem, formatKeyToLabel, type TransformedField } from '@/lib/transform'

const props = defineProps<{ fields: TransformedField[] }>()
const form = defineModel<Record<string, unknown>>({ required: true })

const groups = computed(() => {
  const map = new Map<string, TransformedField[]>()
  for (const field of props.fields) {
    const list = map.get(field.groupName) ?? []
    list.push(field)
    map.set(field.groupName, list)
  }
  return [...map].map(([name, fields]) => ({ name, fields }))
})

const LONG_TEXT = /message|description|body|note|summary/i

function isWide(field: TransformedField): boolean {
  return (
    field.type === 'array<object>' || field.type === 'array<string>' || LONG_TEXT.test(field.path)
  )
}

function text(path: string): string {
  const value = form.value[path]
  return value === null || value === undefined ? '' : String(value)
}

function set(path: string, value: string | number) {
  form.value[path] = value
}

function setNumber(path: string, value: string | number) {
  form.value[path] = value === '' ? null : Number(value)
}

function rows(path: string): Record<string, unknown>[] {
  const value = form.value[path]
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : []
}

function addRow(field: TransformedField) {
  form.value[field.path] = [...rows(field.path), createEmptyArrayItem(field.schemaBlueprint)]
}

function removeRow(path: string, index: number) {
  form.value[path] = rows(path).filter((_, i) => i !== index)
}

function strings(path: string): string[] {
  const value = form.value[path]
  return Array.isArray(value) ? (value as string[]) : []
}

function setString(path: string, index: number, value: string) {
  const next = [...strings(path)]
  next[index] = value
  form.value[path] = next
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <section v-for="group in groups" :key="group.name" class="flex flex-col gap-3">
      <h2 class="text-xs text-muted">{{ group.name }}</h2>
      <div class="grid grid-cols-6 gap-3">
        <template v-for="field in group.fields" :key="field.path">
          <div :class="isWide(field) ? 'col-span-6' : 'col-span-6 sm:col-span-3 xl:col-span-2'">
            <UiField
              v-if="field.type === 'enum'"
              :model-value="text(field.path)"
              :label="field.label"
              :options="field.options?.map((o) => o.value) ?? []"
              @update:model-value="set(field.path, $event)"
            />

            <label
              v-else-if="field.type === 'boolean'"
              class="flex h-9.5 items-center gap-2 text-sm font-medium text-body"
            >
              <input
                type="checkbox"
                class="size-4 accent-primary"
                :checked="Boolean(form[field.path])"
                @change="form[field.path] = ($event.target as HTMLInputElement).checked"
              />
              {{ field.label }}
            </label>

            <div v-else-if="field.type === 'array<object>'" class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-body">{{ field.label }}</span>
                <UiButton variant="secondary" size="sm" @click="addRow(field)">Add item</UiButton>
              </div>
              <p
                v-if="!rows(field.path).length"
                class="rounded-md border border-dashed border-line px-3 py-4 text-center text-xs text-muted"
              >
                No items yet.
              </p>
              <div
                v-for="(item, index) in rows(field.path)"
                :key="index"
                class="flex flex-col gap-3 rounded-md border border-line bg-raised p-3"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-muted">#{{ index + 1 }}</span>
                  <button
                    type="button"
                    class="text-xs text-alert-400 hover:text-alert-500"
                    @click="removeRow(field.path, index)"
                  >
                    Remove
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <UiField
                    v-for="(subType, subKey) in field.schemaBlueprint"
                    :key="String(subKey)"
                    :model-value="(item[String(subKey)] as string | number) ?? ''"
                    :label="formatKeyToLabel(String(subKey))"
                    :type="subType === 'number' || subType === 'integer' ? 'number' : 'text'"
                    :multiline="LONG_TEXT.test(String(subKey))"
                    :rows="2"
                    :class="LONG_TEXT.test(String(subKey)) ? 'col-span-2' : ''"
                    @update:model-value="
                      item[String(subKey)] =
                        subType === 'number' || subType === 'integer' ? Number($event) : $event
                    "
                  />
                </div>
              </div>
            </div>

            <div v-else-if="field.type === 'array<string>'" class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-body">{{ field.label }}</span>
                <UiButton
                  variant="secondary"
                  size="sm"
                  @click="form[field.path] = [...strings(field.path), '']"
                >
                  Add
                </UiButton>
              </div>
              <UiField
                v-for="(value, index) in strings(field.path)"
                :key="index"
                :model-value="value"
                :label="`${field.label} ${index + 1}`"
                @update:model-value="setString(field.path, index, String($event))"
              />
            </div>

            <UiField
              v-else-if="field.type === 'number' || field.type === 'integer'"
              :model-value="text(field.path)"
              :label="field.label"
              type="number"
              @update:model-value="setNumber(field.path, $event)"
            />

            <UiField
              v-else
              :model-value="text(field.path)"
              :label="field.label"
              :type="field.type === 'date' ? 'date' : 'text'"
              :multiline="LONG_TEXT.test(field.path)"
              :rows="3"
              @update:model-value="set(field.path, $event)"
            />
          </div>
        </template>
      </div>
    </section>
  </div>
</template>