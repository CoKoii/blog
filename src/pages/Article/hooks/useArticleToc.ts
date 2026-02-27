import type { Heading } from '@/types/article-hooks'
import { onMounted, onUnmounted, ref } from 'vue'
import type { TocItem } from '../types'
import { refreshArticleDecorations as refreshDecorations } from './useArticleDecorations'

const SELECTOR = '.markdown-content h1, .markdown-content h2, .markdown-content h3'
const GAP = 100
const canUseDOM = typeof window !== 'undefined'
const MAX_RETRIES = 3

export const useArticleToc = () => {
  const toc = ref<TocItem[]>([])
  const activeHeadingId = ref('')
  let headings: Heading[] = []
  let raf = 0
  let cachedOffset = 0
  let offsetObserver: ResizeObserver | null = null
  let retryCount = 0
  let retryRaf = 0

  const normalizeText = (text: string) =>
    text
      .replace(/^[\d.]+\s+/, '')
      .replace(/\s+/g, ' ')
      .trim()

  const getConnectedHeadings = () => headings.filter((h) => h.el.isConnected)

  const refreshOffset = () => {
    const bar = document.querySelector('.Layout .topBar')
    const height =
      bar instanceof HTMLElement
        ? bar.getBoundingClientRect().height
        : Number.parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--layout-topbar-height'),
          ) || 0
    cachedOffset = height + GAP
  }

  const decodeHash = (hash: string) => {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash
    if (!raw) return ''
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  const getHashId = () => decodeHash(window.location.hash)

  const updateHash = (id: string) => {
    const current = getHashId()
    if (current === id) return
    const url = id
      ? `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`
      : `${window.location.pathname}${window.location.search}`
    window.history.replaceState(window.history.state, '', url)
  }

  const isBottom = () =>
    window.scrollY + window.innerHeight >=
    Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0) - 2

  const getActiveId = () => {
    if (!headings.length) return ''
    const connectedHeadings = getConnectedHeadings()
    if (!connectedHeadings.length) return ''
    if (isBottom()) return connectedHeadings[connectedHeadings.length - 1]!.id

    let id = connectedHeadings[0]!.id
    for (const h of connectedHeadings) {
      if (h.el.getBoundingClientRect().top <= cachedOffset) {
        id = h.id
      } else {
        break
      }
    }
    return id
  }

  const syncActive = (force = false) => {
    const id = getActiveId()
    if (id && (force || id !== activeHeadingId.value)) {
      activeHeadingId.value = id
      updateHash(id)
    }
  }

  const scheduleSync = (force = false) => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      syncActive(force)
    })
  }

  const watchOffset = () => {
    const bar = document.querySelector('.Layout .topBar')
    if (!bar || typeof ResizeObserver === 'undefined') return
    offsetObserver?.disconnect()
    offsetObserver = new ResizeObserver(() => {
      const prev = cachedOffset
      refreshOffset()
      if (cachedOffset !== prev) scheduleSync(true)
    })
    offsetObserver.observe(bar)
  }

  const handleHashChange = () => {
    if (!headings.length) return
    const id = getHashId()
    if (id && getConnectedHeadings().some((h) => h.id === id)) {
      activeHeadingId.value = id
    } else {
      scheduleSync(true)
    }
  }

  const handleScroll = () => scheduleSync()
  const handleResize = () => scheduleSync(true)

  const refreshToc = (isRetry = false) => {
    if (isRetry) retryCount++
    const nodes = Array.from(document.querySelectorAll(SELECTOR))
    headings = nodes
      .filter((n): n is HTMLElement => n instanceof HTMLElement)
      .map((el, i) => {
        const level = Number.parseInt(el.tagName[1] ?? '1', 10)
        const text = normalizeText(el.textContent ?? '')
        const id = el.id || `heading-${i}`
        if (!el.id) el.id = id
        return { id, text, level, el }
      })
    toc.value = headings.map(({ id, text, level }) => ({ id, text, level }))

    if (!headings.length) {
      if (retryCount < MAX_RETRIES) {
        if (retryRaf) cancelAnimationFrame(retryRaf)
        retryRaf = requestAnimationFrame(() => {
          retryRaf = 0
          refreshToc(true)
        })
      }
      activeHeadingId.value = ''
      updateHash('')
      return
    }

    retryCount = 0
    const hashId = getHashId()
    if (hashId && headings.some((h) => h.id === hashId)) {
      activeHeadingId.value = hashId
    } else {
      scheduleSync(true)
    }
  }

  const resetTocState = () => {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
    if (retryRaf) {
      cancelAnimationFrame(retryRaf)
      retryRaf = 0
    }
    retryCount = 0
    toc.value = []
    activeHeadingId.value = ''
    headings = []
  }

  const refreshArticleDecorations = () => {
    refreshDecorations()
    refreshToc()
  }

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    activeHeadingId.value = id
    updateHash(id)
    const top = el.getBoundingClientRect().top + window.scrollY - cachedOffset + 1
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  onMounted(() => {
    if (!canUseDOM) return
    refreshOffset()
    watchOffset()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    window.addEventListener('hashchange', handleHashChange)
  })

  onUnmounted(() => {
    if (!canUseDOM) return
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('hashchange', handleHashChange)
    offsetObserver?.disconnect()
    offsetObserver = null
    resetTocState()
  })

  return { toc, activeHeadingId, resetTocState, refreshArticleDecorations, scrollToHeading }
}
