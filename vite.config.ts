import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { readProductVersionFromChangelog } from './scripts/readProductVersion'

const changelogPath = fileURLToPath(
  new URL('../backend/CHANGELOG.md', import.meta.url),
)
const appVersion = readProductVersionFromChangelog(changelogPath)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
