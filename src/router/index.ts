import type { RouteRecordRaw } from 'vue-router'
import { getAllPosts } from '@/utils/posts'
import { ALL_TAG_SLUG, getTagSlugSet } from '@/utils/tags'

const allPosts = getAllPosts()
const validCategorySlugs = getTagSlugSet()
const validArticleIds = new Set(allPosts.map((post) => `${post.categorySlug}/${post.slug}`))

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
        component: () => import('../pages/article/index.vue'),
        beforeEnter: (to) => {
          const category = String(to.params.category || '')
          const id = String(to.params.id || '')
          if (!category || !id || !validArticleIds.has(`${category}/${id}`)) {
            return { name: 'not-found' }
          }
        },
      },
      {
        path: '/tags/:category',
        name: 'tags',
        component: () => import('../pages/tags/index.vue'),
        beforeEnter: (to) => {
          const category = String(to.params.category || '')
          if (!category || (!validCategorySlugs.has(category) && category !== ALL_TAG_SLUG)) {
            return { name: 'not-found' }
          }
        },
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
