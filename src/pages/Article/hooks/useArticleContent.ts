import type { Component } from 'vue'
import { nextTick, onServerPrefetch, ref, shallowRef, watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { PostFrontmatter, PostModule } from '@/types/post'
import {
  findPostBySlug,
  getAllPosts,
  getPostContent,
  getPostContentSync,
  parsePostId,
} from '@/utils/posts'
import { safeDecodeURIComponent } from '@/utils/strings'

export const DEFAULT_FRONTMATTER: PostFrontmatter = {
  title: '',
  coverImage: '',
  tags: [],
  wordCount: 0,
  readTime: 0,
  publishDate: '',
  location: '',
  comments: 0,
}

type UseArticleContentOptions = {
  onBeforeContentChange?: () => void
  onAfterContentReady?: () => void
}

export const resolveTitleFromSlug = (slug?: string): string =>
  safeDecodeURIComponent(slug || '') || 'Untitled'

export const useArticleContent = (
  route: RouteLocationNormalizedLoaded,
  options: UseArticleContentOptions = {},
) => {
  const ContentComponent = shallowRef<Component | null>(null)
  const frontmatter = ref<PostFrontmatter>({ ...DEFAULT_FRONTMATTER })
  const resolvedTitle = ref('')
  const loadedArticleId = ref('')
  const loadToken = ref(0)

  const canUseDOM = typeof window !== 'undefined' && typeof document !== 'undefined'
  const isServer = import.meta.env.SSR

  const runAfterContentReady = () => {
    if (!canUseDOM || !options.onAfterContentReady) return
    void nextTick().then(() => {
      const runNextFrame =
        window.requestAnimationFrame?.bind(window) ||
        ((cb: FrameRequestCallback) => window.setTimeout(cb, 0))
      runNextFrame(() => {
        options.onAfterContentReady?.()
      })
    })
  }

  const applyContent = (id: string, module: PostModule | null) => {
    if (!module) return
    ContentComponent.value = module.default
    frontmatter.value = { ...DEFAULT_FRONTMATTER, ...module.frontmatter }
    loadedArticleId.value = id
    runAfterContentReady()
  }

  const resolveArticle = (categorySlug: string, articleSlug: string) => {
    if (!categorySlug || !articleSlug) return null

    const allPosts = getAllPosts()
    const post = findPostBySlug(categorySlug, articleSlug, allPosts)

    if (!post) {
      console.warn(`Article not found: ${categorySlug}/${articleSlug}`)
      return null
    }

    const id = post.id
    resolvedTitle.value = resolveTitleFromSlug(parsePostId(post.id)?.slug || '')

    if (loadedArticleId.value === id && ContentComponent.value) return null

    return { id }
  }

  const loadArticle = (categorySlug: string, articleSlug: string) => {
    const resolved = resolveArticle(categorySlug, articleSlug)
    if (!resolved) return

    const { id } = resolved
    const currentToken = ++loadToken.value
    const syncModule = getPostContentSync(id)

    if (syncModule) {
      options.onBeforeContentChange?.()
      applyContent(id, syncModule)
      return
    }

    ContentComponent.value = null
    frontmatter.value = { ...DEFAULT_FRONTMATTER }
    options.onBeforeContentChange?.()

    void getPostContent(id).then((module) => {
      if (loadToken.value !== currentToken) return
      applyContent(id, module)
    })
  }

  onServerPrefetch(async () => {
    const categorySlug =
      typeof route.params.category === 'string' ? route.params.category : String(route.params.category || '')
    const articleSlug =
      typeof route.params.id === 'string' ? route.params.id : String(route.params.id || '')
    const resolved = resolveArticle(categorySlug, articleSlug)
    if (!resolved) return
    const { id } = resolved
    const module = await getPostContent(id)
    applyContent(id, module)
  })

  if (!isServer) {
    watch(
      () => [route.params.category, route.params.id],
      ([category, id]) => {
        loadArticle(String(category || ''), String(id || ''))
      },
      { immediate: true },
    )
  }

  return {
    ContentComponent,
    frontmatter,
    resolvedTitle,
  }
}
