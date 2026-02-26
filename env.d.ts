/// <reference types="vite/client" />
/// <reference types="unplugin-vue-markdown/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __GITHUB_TOKEN__: string

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'virtual:posts-meta' {
  import type { PostMeta } from '@/types/post'
  export const postsMeta: PostMeta[]
}

declare module 'virtual:search-index' {
  import type { SearchIndex } from '@/types/search'
  export const searchIndex: SearchIndex
}

declare module '*.json' {
  const value: unknown
  export default value
}
