import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  cacheDir: '.vite-cache',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: mode === 'production' ? 'esbuild' : false,
    sourcemap: mode !== 'production',
  },
  server: { port: 3000, open: true },
}))
