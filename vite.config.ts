import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Относительные пути: сайт работает из любой папки, в том числе на GitHub Pages
  base: './',
  plugins: [react()],
  build: {
    // Крупнее всех CodeMirror, около 530 КБ: его грузят только экраны уровней
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Библиотеки отдельными файлами: они меняются редко, и после новой публикации браузер берёт их из кеша
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/ },
            { name: 'codemirror', test: /node_modules[\\/](@codemirror|@lezer|crelt|style-mod|w3c-keyname)[\\/]/ },
          ],
        },
      },
    },
  },
  // Явный IPv4: на некоторых Windows соединения с ::1 (IPv6-localhost) заблокированы
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
})
