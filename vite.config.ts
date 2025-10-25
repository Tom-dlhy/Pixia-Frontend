import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
// import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'


export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    viteReact(),
    nitro({ config: { preset: 'node-server' } }),
    tanstackStart(),
    // nitroV2Plugin({ preset: 'node-server' }),
  ],
})
