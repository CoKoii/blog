import { getTagMeta } from '@/config'
import type { MenuType } from '@/types/menus'
import { tagEntriesRef } from '@/utils/tags'
import { computed } from 'vue'

export const menusRef = computed<MenuType[]>(() => [
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
    children: tagEntriesRef.value.map((tag) => ({
      title: tag.label,
      color: getTagMeta(tag.label).color,
      path: `/tags/${tag.slug}`,
    })),
  },
])
