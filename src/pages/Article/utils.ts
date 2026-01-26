import {
  computed,
  createApp,
  defineComponent,
  h,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watchEffect,
} from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useHead } from '@vueuse/head'
import { siteImage, siteName, siteOwner, siteUrl } from '@/config'
import { formatDate } from '@/utils/date'
import { findPostBySlug, getAllPosts, getPostContent, parsePostId } from '@/utils/posts'
import { safeDecodeURIComponent } from '@/utils/strings'
import type { Component } from 'vue'
import type { PostFrontmatter } from '@/types/post'
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

const getTitleFromSlug = (slug?: string): string => safeDecodeURIComponent(slug || '') || 'Untitled'

export const useArticlePage = () => {
  const route = useRoute()
  const ContentComponent = shallowRef<Component | null>(null)
  const toc = ref<TocItem[]>([])
  const activeHeadingId = ref<string>('')
  const frontmatter = ref<PostFrontmatter>({ ...DEFAULT_FRONTMATTER })
  const resolvedTitle = ref('')

  const canUseDOM = typeof window !== 'undefined' && typeof document !== 'undefined'
  const HEADING_SELECTOR = '.markdown-content h1, .markdown-content h2, .markdown-content h3'
  const SCROLL_OFFSET = 400

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

  const getHeadings = (): HTMLElement[] => {
    if (!canUseDOM) return []
    return Array.from(document.querySelectorAll(HEADING_SELECTOR)) as HTMLElement[]
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
    const publishDateIso = publishDateRaw ? new Date(publishDateRaw).toISOString() : ''

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
      { name: 'twitter:card', content: 'summary_large_image' },
    ] as Array<Record<string, string>>

    if (coverImage) {
      meta.push({ property: 'og:image', content: fullCoverImage })
    }

    if (publishDateIso) {
      meta.push({ property: 'article:published_time', content: publishDateIso })
    }

    if (article.value.tags.length > 0) {
      meta.push({ name: 'keywords', content: article.value.tags.join(', ') })
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
            ...(coverImage && { image: fullCoverImage }),
            ...(publishDateIso && { datePublished: publishDateIso }),
            author: { '@type': 'Person', name: siteOwner.name },
            description,
          }),
        },
      ],
    }
  })

  const generateToc = () => {
    const headings = getHeadings()
    const tocItems: TocItem[] = []

    headings.forEach((heading, index) => {
      const level = Number.parseInt(heading.tagName.substring(1), 10)
      let text = heading.textContent || ''
      text = text.replace(/^[\d\.]+\s+/, '')
      let id = heading.id

      if (!id) {
        id = `heading-${index}`
        heading.id = id
      }

      tocItems.push({ id, text, level })
    })

    toc.value = tocItems
  }

  const handleScroll = () => {
    const headings = getHeadings()
    const scrollPosition = window.scrollY + SCROLL_OFFSET

    let activeId = ''

    headings.forEach((heading) => {
      if (heading.offsetTop <= scrollPosition) {
        activeId = heading.id
      }
    })

    if (!activeId) {
      const firstHeading = headings[0]
      if (firstHeading) {
        activeId = firstHeading.id
      }
    }

    activeHeadingId.value = activeId
  }

  const scrollToHeading = (id: string) => {
    if (!canUseDOM) return

    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.offsetTop - 80
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      })
    }
  }

  onMounted(() => {
    if (!canUseDOM) return
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    if (!canUseDOM) return
    window.removeEventListener('scroll', handleScroll)
  })

  watchEffect(async () => {
    const categorySlug = route.params.category as string
    const articleSlug = route.params.id as string
    if (!categorySlug || !articleSlug) return
    resolvedTitle.value = ''

    const allPosts = getAllPosts()
    const post = findPostBySlug(categorySlug, articleSlug, allPosts)

    if (!post) {
      console.warn(`Article not found: ${categorySlug}/${articleSlug}`)
      return
    }

    const id = post.id
    resolvedTitle.value = getTitleFromSlug(parsePostId(post.id)?.slug || '')

    ContentComponent.value = null
    frontmatter.value = { ...DEFAULT_FRONTMATTER }
    toc.value = []
    activeHeadingId.value = ''

    try {
      const module = await getPostContent(id)

      if (!module) return

      ContentComponent.value = module.default
      frontmatter.value = { ...DEFAULT_FRONTMATTER, ...module.frontmatter }

      if (!canUseDOM) return
      await nextTick()
      const schedule =
        window.requestAnimationFrame?.bind(window) ||
        ((cb: FrameRequestCallback) => window.setTimeout(cb, 0))
      schedule(() => {
        enhanceCodeBlocks()
        generateToc()
        handleScroll()
      })
    } catch (error) {
      console.error('Failed to load article:', error)
    }
  })

  return {
    ContentComponent,
    toc,
    activeHeadingId,
    article,
    scrollToHeading,
  }
}
