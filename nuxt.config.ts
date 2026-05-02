import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})