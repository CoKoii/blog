import type { MenuType } from '@/types/menus'
import { getAllPosts } from '@/utils/posts'
import { getTagColor } from '@/config'

const tagMenus = (() => {
  const posts = getAllPosts()
  const seen = new Set<string>()
  return posts.reduce(
    (acc, post) => {
      if (seen.has(post.category)) return acc
      seen.add(post.category)
      acc.push({
        title: post.category,
        color: getTagColor(post.category),
        path: `/tags/${post.categorySlug}`,
      })
      return acc
    },
    [] as { title: string; color?: string; path: string }[],
  )
})()

const menus: MenuType[] = [
  {
    showTitle: false,
    children: [
      {
        title: 'Home',
        icon: 'mynaui:home',
        path: '/',
      },
      {
        title: 'About',
        icon: 'charm:person',
        path: '/about',
      },
    ],
  },
  {
    title: 'Tags',
    children: tagMenus,
  },
]
export default menus
