import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../components/Layout/index.vue'),
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import('../pages/Home/index.vue'),
      },
    ],
  },
]

export default routes
