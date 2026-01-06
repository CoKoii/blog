import type { MenuType } from '@/types/menus'

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
    children: [
      {
        title: '技术总结',
        color: '#00C2FF', // 亮青蓝
        path: '/jszj',
      },
      {
        title: 'Indiehacker',
        color: '#FF5C8A', // 活力粉红
        path: '/indiehacker',
      },
      {
        title: 'Dokploy',
        color: '#5B6CFF', // 电光蓝紫
        path: '/dokploy',
      },
      {
        title: 'SEO',
        color: '#2BD96B', // 荧光绿
        path: '/seo',
      },
      {
        title: 'Payment',
        color: '#FFB703', // 明亮橙黄
        path: '/payment',
      },
      {
        title: 'Nodejs',
        color: '#4ADE80', // 鲜绿（偏技术感）
        path: '/nodejs',
      },
    ],
  },
]
export default menus
