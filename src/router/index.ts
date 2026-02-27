import { getAllPosts } from '@/utils/posts'
import { ALL_TAG_SLUG, getTagSlugSet } from '@/utils/tags'
import type { RouteRecordRaw } from 'vue-router'

const posts = getAllPosts()
const catSlugs = getTagSlugSet()
const artIds = new Set(posts.map((p) => `${p.categorySlug}/${p.slug}`))

const isValidArticle = (category: string, id: string) =>
  !!category && !!id && artIds.has(`${category}/${id}`)
const isValidTag = (category: string) =>
  !!category && (catSlugs.has(category) || category === ALL_TAG_SLUG)

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../components/Layout/index.vue'),
    children: [
      { path: '/', name: 'home', component: () => import('../pages/Home/index.vue') },
      {
        path: '/article/:category/:id',
        name: 'article',
        component: () => import('../pages/Article/index.vue'),
        beforeEnter: (to) => {
          const cat = String(to.params.category ?? '')
          const id = String(to.params.id ?? '')
          if (!isValidArticle(cat, id)) return { name: 'not-found' }
        },
      },
      {
        path: '/tags/:category',
        name: 'tags',
        component: () => import('../pages/Tags/index.vue'),
        beforeEnter: (to) => {
          const cat = String(to.params.category ?? '')
          if (!isValidTag(cat)) return { name: 'not-found' }
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
