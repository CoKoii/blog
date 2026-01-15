import type { MenuType } from '@/types/menus'
import { getAllCategories } from '@/utils/posts'
import { defaultTagColor, tagColorMap } from '@/config/tagColors'

const tagMenus = getAllCategories().map((category) => ({
  title: category,
  color: tagColorMap[category] ?? defaultTagColor,
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
