import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, el frontend (Vite, puerto 5173) y el backend (Express, puerto 3001)
    // son dos servidores distintos. Con este proxy, cuando el navegador pide /api/...
    // a Vite, Vite se lo reenvía al backend. Así el navegador cree que todo viene del
    // mismo sitio y no hay problemas de CORS ni hace falta escribir el puerto en el código.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
