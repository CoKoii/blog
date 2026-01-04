import { createPinia } from 'pinia'
import App from './App.vue'
import routes from './router'
import { ViteSSG } from 'vite-ssg'
import './styles/reset.scss'
export const createApp = ViteSSG(App, { routes }, ({ app }) => {
  app.use(createPinia())
})
