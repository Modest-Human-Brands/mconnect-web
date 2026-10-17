import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vite-plus'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      env: {
        VITE_PUBLIC_SITE_URL: '',
        VITE_MCONNECT_API_URL: '',
        VITE_DEFAULT_ORGANIZATION_ID: '',
        VITE_MCONNECT_USER_ID: '',
      },
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)