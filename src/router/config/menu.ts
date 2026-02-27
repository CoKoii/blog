import { getTagMeta } from '@/config'
import type { MenuType } from '@/types/menus'
import { getTagEntries } from '@/utils/tags'

const menus: MenuType[] = [
  {
    showTitle: false,
    children: [
      {
        title: 'Home',
        icon: 'octicon:home-16',
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
    children: getTagEntries().map((tag) => ({
      title: tag.label,
      color: getTagMeta(tag.label).color,
      path: `/tags/${tag.slug}`,
    })),
  },
]
export default menus
