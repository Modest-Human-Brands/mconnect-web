import { describe, expect, it } from 'vite-plus/test'

import {
  buildVariables,
  initFormDataFromSchema,
  parseEnumType,
  transformSchema,
} from '../transform'

describe('transformSchema', () => {
  it('flattens nested objects into dotted paths and skips server-owned keys', () => {
    const fields = transformSchema({
      recipient: { name: 'string' },
      organization: { name: 'string' },
      tracking: 'string',
      status: 'enum:paid|Paid,due|Due',
    })

    expect(fields.map((f) => f.path)).toEqual(['recipient.name', 'status'])
    expect(fields[1]?.options).toEqual([
      { value: 'paid', label: 'Paid' },
      { value: 'due', label: 'Due' },
    ])
  })
})

describe('parseEnumType', () => {
  it('falls back to the value when no label is given', () => {
    expect(parseEnumType('enum:a,b|B')).toEqual([
      { value: 'a', label: 'a' },
      { value: 'b', label: 'B' },
    ])
  })
})

describe('buildVariables', () => {
  it('nests dotted paths and prunes empty values', () => {
    const fields = transformSchema({ recipient: { name: 'string', note: 'string' } })
    const form = initFormDataFromSchema(fields, { recipient: { name: 'Rhea' } })

    expect(buildVariables(form)).toEqual({ recipient: { name: 'Rhea' } })
  })
})