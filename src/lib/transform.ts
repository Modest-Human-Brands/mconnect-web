import type { BrandSettings, EnumOption, SchemaNodeType } from '../types/email'

export interface TransformedField {
  path: string
  label: string
  type: string
  groupName: string
  options?: EnumOption[]
  schemaBlueprint?: Record<string, unknown>
}

/**
 * Parses the "enum:id|Label,id2|Label2" convention into a typed option list.
 */
export function parseEnumType(rawType: string): EnumOption[] {
  const raw = rawType.slice('enum:'.length)
  if (!raw) return []
  return raw
    .split(',')
    .filter(Boolean)
    .map((pair): EnumOption => {
      const parts = pair.split('|')
      const value = parts[0]?.trim() ?? ''
      const label = parts[1]?.trim() ?? value
      return { value, label: label || value }
    })
    .filter((opt) => opt.value.length > 0)
}

export function transformSchema(
  schemaVariables: Record<string, SchemaNodeType>,
  currentPath = '',
  parentGroupName = 'General Details',
  labelPrefix = '',
): TransformedField[] {
  const fields: TransformedField[] = []

  for (const [key, type] of Object.entries(schemaVariables)) {
    if (!currentPath && (key === 'organization' || key === 'tracking')) {
      continue
    }

    const path = currentPath ? `${currentPath}.${key}` : key
    const formattedKey = formatKeyToLabel(key)
    const fullLabel = labelPrefix ? `${labelPrefix} ${formattedKey}` : formattedKey

    if (Array.isArray(type)) {
      const firstItem = type[0]
      if (typeof firstItem === 'object' && firstItem !== null) {
        fields.push({
          path,
          label: fullLabel,
          type: 'array<object>',
          groupName: parentGroupName,
          schemaBlueprint: firstItem as Record<string, unknown>,
        })
      } else {
        fields.push({
          path,
          label: fullLabel,
          type: `array<${firstItem !== undefined ? typeof firstItem : 'unknown'}>`,
          groupName: parentGroupName,
        })
      }
    } else if (typeof type === 'string' && type.startsWith('enum:')) {
      fields.push({
        path,
        label: fullLabel,
        type: 'enum',
        groupName: parentGroupName,
        options: parseEnumType(type),
      })
    } else if (typeof type === 'object' && type !== null) {
      fields.push(
        ...transformSchema(type as Record<string, SchemaNodeType>, path, formattedKey, fullLabel),
      )
    } else {
      fields.push({
        path,
        label: fullLabel,
        type: String(type),
        groupName: parentGroupName,
      })
    }
  }

  return fields
}

export function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, path))
    } else {
      result[path] = value
    }
  }
  return result
}

export function createEmptyArrayItem(blueprint?: Record<string, unknown>): Record<string, unknown> {
  if (!blueprint) return {}
  const item: Record<string, unknown> = {}
  for (const [key, type] of Object.entries(blueprint)) {
    if (type === 'number' || type === 'integer') {
      item[key] = 0
    } else if (type === 'boolean') {
      item[key] = false
    } else if (type === 'date') {
      item[key] = new Date().toISOString().slice(0, 10)
    } else {
      item[key] = ''
    }
  }
  return item
}

export function initFormDataFromSchema(
  fields: TransformedField[],
  placeholders?: Record<string, unknown>,
): Record<string, unknown> {
  const flatPlaceholders = placeholders ? flattenObject(placeholders) : {}
  const initialData: Record<string, unknown> = {}

  for (const field of fields) {
    if (flatPlaceholders[field.path] !== undefined) {
      const val = flatPlaceholders[field.path]
      if (val instanceof Date) {
        initialData[field.path] = val.toISOString().slice(0, 10)
      } else if (Array.isArray(val)) {
        initialData[field.path] = JSON.parse(JSON.stringify(val))
      } else if (typeof val === 'object' && val !== null) {
        initialData[field.path] = JSON.parse(JSON.stringify(val))
      } else {
        initialData[field.path] = val
      }
      continue
    }

    if (field.type === 'array<object>') {
      initialData[field.path] = []
    } else if (field.type === 'array<string>') {
      initialData[field.path] = []
    } else if (field.type === 'boolean') {
      initialData[field.path] = false
    } else if (field.type === 'number' || field.type === 'integer') {
      initialData[field.path] = null
    } else if (field.type === 'record') {
      initialData[field.path] = {}
    } else {
      initialData[field.path] = ''
    }
  }

  return initialData
}

export function unflattenPayload(flatRecord: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [flatKey, value] of Object.entries(flatRecord)) {
    const keys = flatKey.split('.')
    let current: Record<string, unknown> = result

    for (let i = 0; i < keys.length; i++) {
      const segment = keys[i]
      if (segment === undefined) continue
      if (i === keys.length - 1) {
        current[segment] = value
      } else {
        const nextVal = current[segment]
        if (typeof nextVal !== 'object' || nextVal === null || Array.isArray(nextVal)) {
          current[segment] = {}
        }
        current = current[segment] as Record<string, unknown>
      }
    }
  }

  return result
}

export function pruneEmpty(val: unknown): unknown {
  if (val === null || val === undefined || val === '') {
    return undefined
  }
  if (typeof val === 'boolean' || typeof val === 'number') {
    return val
  }
  if (Array.isArray(val)) {
    const cleaned = val.map(pruneEmpty).filter((v): v is unknown => v !== undefined)
    return cleaned.length > 0 ? cleaned : undefined
  }
  if (typeof val === 'object') {
    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      const res = pruneEmpty(v)
      if (res !== undefined) {
        cleaned[k] = res
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined
  }
  return val
}

export type FieldResolver = (id: string) => Promise<unknown>
export async function retransformTemplateData(
  formData: Record<string, unknown>,
  brand: BrandSettings,
  resolvers: Record<string, FieldResolver> = {},
): Promise<Record<string, unknown>> {
  const userVariables = (pruneEmpty(unflattenPayload(formData)) as Record<string, unknown>) || {}

  for (const [key, resolve] of Object.entries(resolvers)) {
    const current = userVariables[key]
    if (current === undefined || current === null || current === '') continue

    let targetId: string | undefined
    if (typeof current === 'object' && current !== null) {
      const obj = current as Record<string, unknown>
      targetId =
        typeof obj.id === 'string' ? obj.id : typeof obj.value === 'string' ? obj.value : undefined
    } else if (typeof current === 'string') {
      targetId = current
    }

    if (!targetId) continue

    try {
      userVariables[key] = await resolve(targetId)
    } catch (err) {
      console.error(`[retransformTemplateData] Failed to resolve "${key}" (${targetId}):`, err)
    }
  }

  const organization = pruneEmpty({
    name: brand.companyName || undefined,
    legalName: brand.legalName || brand.companyName || undefined,
    website: brand.website || undefined,
    contactEmail: brand.contactEmail || undefined,
    branding: {
      logo: brand.logoDataUrl || undefined,
      color: {
        primary: brand.colorPrimary || undefined,
        accent: brand.colorAccent || undefined,
      },
      font: brand.font || undefined,
    },
  })

  const templateData: Record<string, unknown> = {
    ...userVariables,
  }

  if (organization) {
    templateData.organization = organization
  }

  return templateData
}

export function formatKeyToLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}