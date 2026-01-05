import { createPinia } from 'pinia'
import App from './App.vue'
import routes from './router'
import { ViteSSG } from 'vite-ssg'
import './styles/reset.scss'

const base = import.meta.env.BASE_URL

export const createApp = ViteSSG(App, { routes, base }, ({ app }) => {
  app.use(createPinia())
})
