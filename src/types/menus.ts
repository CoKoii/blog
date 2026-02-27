export interface MenuItem {
  title: string
  icon?: string
  color?: string
  path: string
}

export interface MenuType {
  title?: string
  showTitle?: boolean
  children: MenuItem[]
}
