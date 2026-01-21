import type { MenuType } from '@/types/menus'
import { getTagMeta } from '@/config'
import { getTagEntries } from '@/utils/tags'

const tagMenus = getTagEntries().map((tag) => ({
  title: tag.label,
  color: getTagMeta(tag.label).color,
  path: `/tags/${tag.slug}`,
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
