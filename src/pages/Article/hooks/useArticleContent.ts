import type { UseArticleContentOptions } from '@/types/article-hooks'
import type { PostFrontmatter, PostModule } from '@/types/post'
import {
  findPostBySlug,
  getPostContent,
  getPostContentSync,
  postsRef,
  postsRevisionRef,
  parsePostId,
  refreshPostContent,
} from '@/utils/posts'
import { resolveTitleFromSlug } from '@/utils/strings'
import type { Component } from 'vue'
import { nextTick, onServerPrefetch, ref, shallowRef, watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const DEFAULT_FRONTMATTER: PostFrontmatter = {
  title: '',
  coverImage: '',
  tags: [],
  wordCount: 0,
  readTime: 0,
  publishDate: '',
  location: '',
}

const canUseDOM = typeof window !== 'undefined'
const isServer = import.meta.env.SSR
const requestNextFrame = (cb: () => void) =>
  (window.requestAnimationFrame || ((fn: FrameRequestCallback) => setTimeout(fn, 0)))(cb)
const resolvePostTitle = (postId: string) => resolveTitleFromSlug(parsePostId(postId)?.slug ?? '')

export const useArticleContent = (
  route: RouteLocationNormalizedLoaded,
  options: UseArticleContentOptions = {},
) => {
  const ContentComponent = shallowRef<Component | null>(null)
  const frontmatter = ref<PostFrontmatter>({ ...DEFAULT_FRONTMATTER })
  const resolvedTitle = ref('')
  const loadedArticleId = ref('')
  const loadToken = ref(0)

  const runAfterReady = () => {
    if (!canUseDOM || !options.onAfterContentReady) return
    void nextTick().then(() => requestNextFrame(() => options.onAfterContentReady?.()))
  }

  const applyContent = (id: string, module: PostModule | null) => {
    if (!module) return
    ContentComponent.value = module.default
    frontmatter.value = { ...DEFAULT_FRONTMATTER, ...module.frontmatter }
    loadedArticleId.value = id
    runAfterReady()
  }

  const loadArticle = (categorySlug: string, articleSlug: string, force = false) => {
    if (!categorySlug || !articleSlug) return

    const post = findPostBySlug(categorySlug, articleSlug, postsRef.value)
    if (!post) {
      console.warn(`Article not found: ${categorySlug}/${articleSlug}`)
      return
    }

    resolvedTitle.value = resolvePostTitle(post.id)
    if (!force && loadedArticleId.value === post.id && ContentComponent.value) return

    const currentToken = ++loadToken.value
    const syncModule = force ? null : getPostContentSync(post.id)

    if (syncModule) {
      options.onBeforeContentChange?.()
      applyContent(post.id, syncModule)
      return
    }

    options.onBeforeContentChange?.()
    if (!force || !ContentComponent.value) {
      ContentComponent.value = null
      frontmatter.value = { ...DEFAULT_FRONTMATTER }
    }

    const load = force ? refreshPostContent(post.id) : getPostContent(post.id)
    void load.then((module) => {
      if (loadToken.value === currentToken) applyContent(post.id, module)
    })
  }

  onServerPrefetch(async () => {
    const categorySlug = String(route.params.category ?? '')
    const articleSlug = String(route.params.id ?? '')
    const post = findPostBySlug(categorySlug, articleSlug, postsRef.value)
    if (post) {
      resolvedTitle.value = resolvePostTitle(post.id)
      applyContent(post.id, await getPostContent(post.id))
    }
  })

  if (!isServer) {
    watch(
      () => [route.params.category, route.params.id],
      ([category, id]) => loadArticle(String(category ?? ''), String(id ?? '')),
      { immediate: true },
    )
    watch(
      () => postsRevisionRef.value,
      () => loadArticle(String(route.params.category ?? ''), String(route.params.id ?? ''), true),
    )
  }

  return { ContentComponent, frontmatter, resolvedTitle }
}
