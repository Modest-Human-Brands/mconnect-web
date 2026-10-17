import { describe, expect, it } from 'vite-plus/test'

import { pickConfig, readConfig } from '../config'

describe('pickConfig', () => {
  it('returns the first non-blank value, trimmed', () => {
    expect(pickConfig(undefined, '  ', ' abc ', 'later')).toBe('abc')
  })

  it('is an empty string when nothing is set', () => {
    expect(pickConfig()).toBe('')
  })
})

describe('readConfig', () => {
  it('uses build-time values when no runtime config exists', () => {
    expect(readConfig(undefined, { apiBaseUrl: '/api-from-build' }).apiBaseUrl).toBe(
      '/api-from-build',
    )
  })

  it('prefers the runtime config written by the container', () => {
    const config = readConfig(
      { apiBaseUrl: 'https://api.example.com' },
      { apiBaseUrl: '/api-from-build' },
    )
    expect(config.apiBaseUrl).toBe('https://api.example.com')
  })

  it('falls back to the build value when the runtime value is blank', () => {
    expect(readConfig({ apiBaseUrl: '  ' }, { apiBaseUrl: '/x' }).apiBaseUrl).toBe('/x')
  })
})