import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' — относительные пути: работает локально и на GitHub Pages (подпапка репо)
export default defineConfig({
  plugins: [react()],
  base: './',
})
