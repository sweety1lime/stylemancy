import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Относительные пути: сайт работает из любой папки, в том числе на GitHub Pages
  base: './',
  plugins: [react()],
  // Явный IPv4: на некоторых Windows соединения с ::1 (IPv6-localhost) заблокированы
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
})
