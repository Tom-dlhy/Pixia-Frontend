import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    nitro({ config: { preset: 'node-server' } }),
    tanstackStart(),
    tailwindcss(),
    viteReact(),
  ],
})
