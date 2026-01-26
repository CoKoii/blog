/// <reference types="vite/client" />
/// <reference types="unplugin-vue-markdown/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'virtual:posts-meta' {
  import type { PostMeta } from '@/types/post'
  export const postsMeta: PostMeta[]
}

declare module '*.json' {
  const value: unknown
  export default value
}
