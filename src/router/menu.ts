import type { MenuType } from '@/types/menus'
import { getAllCategories } from '@/utils/posts'
import { getTagColor } from '@/config/site'

const tagMenus = getAllCategories().map((category) => ({
  title: category,
  color: getTagColor(category),
  path: `/${category}`,
}))

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
