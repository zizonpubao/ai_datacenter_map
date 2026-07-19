import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages repo name, e.g. '/ai-datacenter-map/'
// Set to '/' for local dev; overridden at build time via --base when deploying.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
