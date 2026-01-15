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
      {
        path: '/article/:category/:id',
        name: 'article',
        component: () => import('../pages/Article/Article.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFound/index.vue'),
  },
]

export default routes
