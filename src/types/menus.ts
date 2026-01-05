export interface MenuType {
  title?: string
  showTitle?: boolean
  children: { title: string; icon?: string; color?: string; path: string }[]
}
