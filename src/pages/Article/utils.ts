import { siteImage, siteName, siteOwner, siteUrl } from '@/config'
import type { PostFrontmatter, PostModule } from '@/types/post'
import { formatDate } from '@/utils/date'
import {
  findPostBySlug,
  getAllPosts,
  getPostContent,
  getPostContentSync,
  parsePostId,
} from '@/utils/posts'
import { safeDecodeURIComponent } from '@/utils/strings'
import { Icon } from '@iconify/vue'
import { useHead } from '@vueuse/head'
import type { Component } from 'vue'
import {
  computed,
  createApp,
  defineComponent,
  h,
  nextTick,
  onMounted,
  onServerPrefetch,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { useRoute } from 'vue-router'
import type { ArticleMeta, TocItem } from './types'

const DEFAULT_FRONTMATTER: PostFrontmatter = {
  title: '',
  coverImage: '',
  tags: [],
  wordCount: 0,
  readTime: 0,
  publishDate: '',
  location: '',
  comments: 0,
}

type HeadingEntry = {
  id: string
  text: string
  level: number
  el: HTMLElement
}

const getTitleFromSlug = (slug?: string): string => safeDecodeURIComponent(slug || '') || 'Untitled'

export const useArticlePage = () => {
  const route = useRoute()
  const ContentComponent = shallowRef<Component | null>(null)
  const toc = ref<TocItem[]>([])
  const activeHeadingId = ref<string>('')
  const frontmatter = ref<PostFrontmatter>({ ...DEFAULT_FRONTMATTER })
  const resolvedTitle = ref('')
  const loadedArticleId = ref('')
  const loadToken = ref(0)
  let headings: HeadingEntry[] = []
  let positions: number[] = []
  let raf = 0
  let needMeasure = false

  const canUseDOM = typeof window !== 'undefined' && typeof document !== 'undefined'
  const HEADING_SELECTOR = '.markdown-content h1, .markdown-content h2, .markdown-content h3'
  const SCROLL_GAP = 16
  const isServer = import.meta.env.SSR
  let observer: ResizeObserver | null = null

  const fallbackTitle = computed(() => getTitleFromSlug(route.params.id as string | undefined))

  const article = computed<ArticleMeta>(() => ({
    title: frontmatter.value.title || resolvedTitle.value || fallbackTitle.value,
    coverImage: frontmatter.value.coverImage || '',
    tags: frontmatter.value.tags || [],
    wordCount: frontmatter.value.wordCount || 0,
    readTime: frontmatter.value.readTime || 0,
    publishDate: formatDate(frontmatter.value.publishDate || frontmatter.value.date),
    location: frontmatter.value.location || '',
    comments: frontmatter.value.comments || 0,
  }))

  const normalizeHeadingText = (text: string) =>
    text
      .replace(/^[\d.]+\s+/, '')
      .replace(/\s+/g, ' ')
      .trim()

  const resetTocState = () => {
    toc.value = []
    activeHeadingId.value = ''
    headings = []
    positions = []
  }

  const getScrollOffset = () => {
    if (!canUseDOM) return 0
    const topBar = document.querySelector('.Layout .topBar') as HTMLElement | null
    const height =
      (topBar?.getBoundingClientRect().height ??
        Number.parseFloat(
          window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--layout-topbar-height'),
        )) ||
      0
    return height + SCROLL_GAP
  }

  const measurePositions = () => {
    positions = headings.map((entry) => entry.el.getBoundingClientRect().top + window.scrollY)
  }

  const getActiveId = () => {
    if (!headings.length || positions.length !== headings.length) return activeHeadingId.value
    const target = window.scrollY + getScrollOffset()
    for (let i = positions.length - 1; i >= 0; i -= 1) {
      if (positions[i]! <= target) return headings[i]?.id || ''
    }
    return headings[0]?.id || ''
  }

  const syncActive = (force = false) => {
    const nextId = getActiveId()
    if (force || nextId !== activeHeadingId.value) activeHeadingId.value = nextId
  }

  const schedule = (measure = false) => {
    if (!canUseDOM) return
    if (measure) needMeasure = true
    if (raf) return
    raf = window.requestAnimationFrame(() => {
      raf = 0
      if (needMeasure) {
        measurePositions()
        needMeasure = false
      }
      syncActive()
    })
  }

  const scheduleMeasure = () => schedule(true)
  const handleScroll = () => schedule()
  const handleResize = () => schedule(true)

  const disconnectObserver = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    if (canUseDOM) window.removeEventListener('load', scheduleMeasure)
  }

  const connectObserver = () => {
    if (!canUseDOM) return
    const articleEl = document.querySelector('.markdown-content')
    if (!articleEl) return
    if ('ResizeObserver' in window) {
      observer = new ResizeObserver(scheduleMeasure)
      observer.observe(articleEl)
      return
    }
    ;(window as Window).addEventListener('load', scheduleMeasure, { once: true })
  }

  const refreshToc = () => {
    if (!canUseDOM) return
    disconnectObserver()
    const nodes = Array.from(document.querySelectorAll(HEADING_SELECTOR)) as HTMLElement[]
    headings = nodes.map((heading, index) => {
      const level = Number.parseInt(heading.tagName.substring(1), 10)
      const text = normalizeHeadingText(heading.textContent || '')
      const id = heading.id || `heading-${index}`
      if (!heading.id) heading.id = id
      return { id, text, level, el: heading }
    })
    toc.value = headings.map(({ id, text, level }) => ({ id, text, level }))
    if (!headings.length) {
      positions = []
      activeHeadingId.value = ''
      return
    }
    measurePositions()
    syncActive(true)
    connectObserver()
  }

  const CopyButton = defineComponent({
    props: {
      text: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const copied = ref(false)
      let resetTimer: number | undefined

      const resetCopied = () => {
        copied.value = false
        if (resetTimer) {
          window.clearTimeout(resetTimer)
          resetTimer = undefined
        }
      }

      const handleCopy = async () => {
        const text = props.text || ''
        if (!text) return
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          const textarea = document.createElement('textarea')
          textarea.value = text
          textarea.style.position = 'fixed'
          textarea.style.top = '-9999px'
          document.body.appendChild(textarea)
          textarea.focus()
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        }
        copied.value = true
        if (resetTimer) window.clearTimeout(resetTimer)
        resetTimer = window.setTimeout(resetCopied, 1600)
      }

      return () =>
        h(
          'button',
          {
            type: 'button',
            class: ['code-copy', { 'is-copied': copied.value }],
            onClick: handleCopy,
            'aria-label': copied.value ? '已复制' : '复制代码',
          },
          [
            h(Icon, {
              class: 'code-copy-icon',
              icon: copied.value ? 'lucide:check' : 'lucide:copy',
              'aria-hidden': 'true',
            }),
          ],
        )
    },
  })

  const enhanceCodeBlocks = () => {
    if (!canUseDOM) return
    const blocks = Array.from(document.querySelectorAll('.markdown-content pre')) as HTMLElement[]
    blocks.forEach((block) => {
      if (block.dataset.codeEnhanced === 'true') return
      const code = block.querySelector('code') as HTMLElement | null
      if (!code) return

      const mount = document.createElement('div')
      mount.className = 'code-copy-mount'
      block.appendChild(mount)
      createApp(CopyButton, { text: code.textContent || '' }).mount(mount)
      block.dataset.codeEnhanced = 'true'
    })
  }

  const articlePath = computed(() => {
    const categorySlug = String(route.params.category || '')
    const articleSlug = String(route.params.id || '')
    if (!categorySlug || !articleSlug) return ''

    return `/article/${categorySlug}/${articleSlug}`
  })

  const canonicalUrl = computed(() => {
    const path = articlePath.value
    return path ? `${siteUrl}${path}` : siteUrl
  })

  useHead(() => {
    const description = frontmatter.value.description || article.value.title
    const coverImage = article.value.coverImage || siteImage
    const publishDateRaw = frontmatter.value.publishDate || frontmatter.value.date
    const modifiedDateRaw =
      (frontmatter.value.updated as string | undefined) ||
      (frontmatter.value.modified as string | undefined) ||
      ''
    const publishDateIso = publishDateRaw ? new Date(publishDateRaw).toISOString() : ''
    const modifiedDateIso = modifiedDateRaw ? new Date(modifiedDateRaw).toISOString() : ''

    const fullCoverImage = coverImage?.startsWith('http') ? coverImage : `${siteUrl}${coverImage}`

    const meta = [
      { name: 'robots', content: 'index, follow' },
      { name: 'description', content: description },
      { property: 'og:title', content: article.value.title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:locale', content: 'zh_CN' },
      { property: 'og:site_name', content: siteName },
      { name: 'twitter:card', content: coverImage ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: article.value.title },
      { name: 'twitter:description', content: description },
      { name: 'author', content: String(frontmatter.value.author || siteOwner.name) },
    ] as Array<Record<string, string>>

    if (coverImage) {
      meta.push({ property: 'og:image', content: fullCoverImage })
      meta.push({ property: 'og:image:alt', content: article.value.title })
      meta.push({ name: 'twitter:image', content: fullCoverImage })
    }

    if (publishDateIso) {
      meta.push({ property: 'article:published_time', content: publishDateIso })
    }

    if (modifiedDateIso) {
      meta.push({ property: 'article:modified_time', content: modifiedDateIso })
    }

    if (article.value.tags.length > 0) {
      meta.push({ name: 'keywords', content: article.value.tags.join(', ') })
      article.value.tags.forEach((tag) => {
        meta.push({ property: 'article:tag', content: tag })
      })
    }

    if (frontmatter.value.category) {
      meta.push({ property: 'article:section', content: String(frontmatter.value.category) })
    }

    return {
      title: article.value.title,
      htmlAttrs: {
        lang: 'zh-CN',
      },
      link: [
        { rel: 'canonical', href: canonicalUrl.value },
        { rel: 'alternate', hreflang: 'zh-CN', href: canonicalUrl.value },
        { rel: 'alternate', hreflang: 'x-default', href: canonicalUrl.value },
      ],
      meta,
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: article.value.title,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonicalUrl.value,
            },
            ...(coverImage && { image: fullCoverImage }),
            ...(publishDateIso && { datePublished: publishDateIso }),
            ...(modifiedDateIso && { dateModified: modifiedDateIso }),
            ...(article.value.wordCount ? { wordCount: article.value.wordCount } : {}),
            ...(article.value.tags.length ? { keywords: article.value.tags.join(', ') } : {}),
            author: { '@type': 'Person', name: siteOwner.name },
            description,
          }),
        },
      ],
    }
  })

  const scrollToHeading = (id: string) => {
    if (!canUseDOM) return
    const element = document.getElementById(id)
    if (!element) return

    const offset = getScrollOffset()
    const targetTop = element.getBoundingClientRect().top + window.scrollY - offset + 1

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    })
  }

  onMounted(() => {
    if (!canUseDOM) return
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    if (!canUseDOM) return
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
    disconnectObserver()
    if (raf) {
      window.cancelAnimationFrame(raf)
      raf = 0
    }
    needMeasure = false
  })

  const applyContent = (id: string, module: PostModule | null) => {
    if (!module) return
    ContentComponent.value = module.default
    frontmatter.value = { ...DEFAULT_FRONTMATTER, ...module.frontmatter }
    loadedArticleId.value = id

    if (!canUseDOM) return
    void nextTick().then(() => {
      const schedule =
        window.requestAnimationFrame?.bind(window) ||
        ((cb: FrameRequestCallback) => window.setTimeout(cb, 0))
      schedule(() => {
        enhanceCodeBlocks()
        refreshToc()
      })
    })
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
    resolvedTitle.value = getTitleFromSlug(parsePostId(post.id)?.slug || '')

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
      disconnectObserver()
      resetTocState()
      applyContent(id, syncModule)
      return
    }

    ContentComponent.value = null
    frontmatter.value = { ...DEFAULT_FRONTMATTER }
    disconnectObserver()
    resetTocState()

    void getPostContent(id).then((module) => {
      if (loadToken.value !== currentToken) return
      applyContent(id, module)
    })
  }

  onServerPrefetch(async () => {
    const categorySlug = route.params.category as string
    const articleSlug = route.params.id as string
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
    toc,
    activeHeadingId,
    article,
    scrollToHeading,
  }
}
