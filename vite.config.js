import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'shared-ring-buffer',
      formats: ['es'],
      fileName: 'index'
    },
    outDir: resolve(__dirname, 'dist')
  },
  plugins: [dts()]
})