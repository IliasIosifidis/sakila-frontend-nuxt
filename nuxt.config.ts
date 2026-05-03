import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080/api/film'
    }
  }
})