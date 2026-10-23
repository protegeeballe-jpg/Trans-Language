import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This must match your GitHub repository name exactly!
  base: '/tagalog-translator/',
})
