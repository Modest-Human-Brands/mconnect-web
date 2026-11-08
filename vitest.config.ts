import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vite-plus'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      env: {
        VITE_MCONNECT_WEB_SITE_URL: '',
        VITE_MCONNECT_WEB_API_URL: '',
        ORGANIZATION_ID: '',
        VITE_MCONNECT_WEB_USER_ID: '',
      },
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)