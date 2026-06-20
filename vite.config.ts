import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Bind to 0.0.0.0 so the dev server is reachable from other devices on the
  // LAN (e.g. a phone on the same WiFi) at http://<this-machine-ip>:5173.
  server: {
    host: true,
    // Allow public tunnel hosts (e.g. *.trycloudflare.com) through Vite's
    // dev-server host check so the site can be opened from a phone on another
    // network. Dev-only; has no effect on the production build.
    allowedHosts: true,
  },
  // @react-three/rapier pulls its own copy of three; force a single instance so
  // raycasting / pointer events (the notebook drag) work across the R3F tree.
  resolve: {
    dedupe: ['three', '@react-three/fiber'],
  },
})
