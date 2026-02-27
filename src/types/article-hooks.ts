import type { ArticleMeta } from '@/types/article'
import type { PostFrontmatter } from '@/types/post'
import type { ComputedRef, Ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export type Heading = { id: string; text: string; level: number; el: HTMLElement }

export type UseArticleContentOptions = {
  onBeforeContentChange?: () => void
  onAfterContentReady?: () => void
}

export type UseArticleHeadOptions = {
  route: RouteLocationNormalizedLoaded
  article: ComputedRef<ArticleMeta>
  frontmatter: Ref<PostFrontmatter>
}
