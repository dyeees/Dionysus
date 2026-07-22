import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: [
        // search up for workspace root
        '..',
        // allow artifacts directory for generated images
        'C:\\Users\\Jessica\\.gemini\\antigravity-ide\\brain\\cfd2459e-0961-4050-aeca-b9562658e7b1'
      ]
    }
  }
})
