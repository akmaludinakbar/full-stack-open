import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const backend = fileURLToPath(new URL('../../part4/bloglist-backend', import.meta.url))
const frontend = fileURLToPath(new URL('../bloglist-frontend', import.meta.url))

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5315', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start:e2e', cwd: backend,
      env: { NODE_ENV: 'test', PORT: '3305' },
      url: 'http://127.0.0.1:3305/api/blogs',
      reuseExistingServer: false,
      timeout: 60000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 10000 },
    },
    {
      command: 'npm run dev -- --port 5315 --strictPort', cwd: frontend,
      env: { BLOGLIST_API_TARGET: 'http://127.0.0.1:3305' },
      url: 'http://127.0.0.1:5315',
      reuseExistingServer: false,
      timeout: 30000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 10000 },
    },
  ],
})
