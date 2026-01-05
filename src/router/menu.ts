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
        color: '#53AD8D',
        path: '/',
      },
      {
        title: 'Indiehacker',
        color: '#B766D1',
        path: '/',
      },
      {
        title: 'Dokploy',
        color: '#234CDB',
        path: '/',
      },
      {
        title: 'SEO',
        color: '#8DD844',
        path: '/',
      },
      {
        title: 'Payment',
        color: '#65DADF',
        path: '/',
      },
      {
        title: 'Nodejs',
        color: '#5B8225',
        path: '/',
      },
    ],
  },
]
export default menus
