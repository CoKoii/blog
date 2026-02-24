import { Icon } from '@iconify/vue'
import { createApp, defineComponent, h, onMounted, onUnmounted, ref } from 'vue'
import type { TocItem } from '../types'

type HeadingEntry = {
  id: string
  text: string
  level: number
  el: HTMLElement
}

export const useArticleToc = () => {
  const toc = ref<TocItem[]>([])
  const activeHeadingId = ref<string>('')
  let headings: HeadingEntry[] = []
  let raf = 0
  let forceSyncPending = false

  const canUseDOM = typeof window !== 'undefined' && typeof document !== 'undefined'
  const HEADING_SELECTOR = '.markdown-content h1, .markdown-content h2, .markdown-content h3'
  const SCROLL_GAP = 16

  const normalizeHeadingText = (text: string) =>
    text
      .replace(/^[\d.]+\s+/, '')
      .replace(/\s+/g, ' ')
      .trim()

  const getScrollOffset = () => {
    if (!canUseDOM) return 0
    const topBar = document.querySelector('.Layout .topBar')
    const height =
      (topBar instanceof HTMLElement
        ? topBar.getBoundingClientRect().height
        : Number.parseFloat(
            window
              .getComputedStyle(document.documentElement)
              .getPropertyValue('--layout-topbar-height'),
          )) || 0
    return height + SCROLL_GAP
  }

  const decodeHashId = (hash: string) => {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash
    if (!raw) return ''
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  const getHashHeadingId = () => {
    if (!canUseDOM) return ''
    return decodeHashId(window.location.hash)
  }

  const updateHashHeadingId = (id: string) => {
    if (!canUseDOM) return
    const currentId = getHashHeadingId()
    if (currentId === id) return
    const nextUrl = id
      ? `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`
      : `${window.location.pathname}${window.location.search}`
    window.history.replaceState(window.history.state, '', nextUrl)
  }

  const isScrolledToBottom = () => {
    if (!canUseDOM) return false
    const doc = document.documentElement
    const body = document.body
    const scrollHeight = Math.max(doc.scrollHeight, body?.scrollHeight || 0)
    const viewportBottom = window.scrollY + window.innerHeight
    return viewportBottom >= scrollHeight - 2
  }

  const hasHeading = (id: string) => headings.some((heading) => heading.id === id)

  const getActiveId = () => {
    if (!canUseDOM || !headings.length) return ''
    if (isScrolledToBottom()) return headings[headings.length - 1]?.id || ''
    const target = window.scrollY + getScrollOffset()
    let currentId = headings[0]?.id || ''
    for (let i = 0; i < headings.length; i += 1) {
      const heading = headings[i]
      if (!heading) continue
      const top = heading.el.getBoundingClientRect().top + window.scrollY
      if (top <= target) {
        currentId = heading.id
        continue
      }
      break
    }
    return currentId
  }

  const syncActive = (force = false) => {
    const nextId = getActiveId()
    if (!nextId) return
    if (force || nextId !== activeHeadingId.value) {
      activeHeadingId.value = nextId
      updateHashHeadingId(nextId)
    }
  }

  const scheduleActiveSync = (force = false) => {
    if (!canUseDOM) return
    if (force) forceSyncPending = true
    if (raf) return
    raf = window.requestAnimationFrame(() => {
      raf = 0
      const nextForce = forceSyncPending
      forceSyncPending = false
      syncActive(nextForce)
    })
  }

  const handleScroll = () => scheduleActiveSync()
  const handleResize = () => scheduleActiveSync(true)
  const handleHashChange = () => {
    if (!canUseDOM || !headings.length) return
    const hashId = getHashHeadingId()
    if (hashId && hasHeading(hashId)) {
      activeHeadingId.value = hashId
      return
    }
    scheduleActiveSync(true)
  }

  const refreshToc = () => {
    if (!canUseDOM) return
    const nodes = Array.from(document.querySelectorAll(HEADING_SELECTOR))
    headings = nodes
      .filter((node): node is HTMLElement => node instanceof HTMLElement)
      .map((heading, index) => {
        const level = Number.parseInt(heading.tagName.substring(1), 10)
        const text = normalizeHeadingText(heading.textContent || '')
        const id = heading.id || `heading-${index}`
        if (!heading.id) heading.id = id
        return { id, text, level, el: heading }
      })
    toc.value = headings.map(({ id, text, level }) => ({ id, text, level }))
    if (!headings.length) {
      activeHeadingId.value = ''
      updateHashHeadingId('')
      return
    }
    const hashId = getHashHeadingId()
    if (hashId && hasHeading(hashId)) {
      activeHeadingId.value = hashId
      return
    }
    scheduleActiveSync(true)
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
    const blocks = Array.from(document.querySelectorAll('.markdown-content pre'))
    blocks
      .filter((block): block is HTMLElement => block instanceof HTMLElement)
      .forEach((block) => {
        if (block.dataset.codeEnhanced === 'true') return
        const code = block.querySelector('code')
        if (!(code instanceof HTMLElement)) return

        const mount = document.createElement('div')
        mount.className = 'code-copy-mount'
        block.appendChild(mount)
        createApp(CopyButton, { text: code.textContent || '' }).mount(mount)
        block.dataset.codeEnhanced = 'true'
      })
  }

  const resetTocState = () => {
    if (canUseDOM && raf) {
      window.cancelAnimationFrame(raf)
      raf = 0
    }
    toc.value = []
    activeHeadingId.value = ''
    headings = []
    forceSyncPending = false
  }

  const refreshArticleDecorations = () => {
    enhanceCodeBlocks()
    refreshToc()
  }

  const scrollToHeading = (id: string) => {
    if (!canUseDOM) return
    const element = document.getElementById(id)
    if (!element) return

    activeHeadingId.value = id
    updateHashHeadingId(id)

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
    window.addEventListener('hashchange', handleHashChange)
  })

  onUnmounted(() => {
    if (!canUseDOM) return
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('hashchange', handleHashChange)
    if (raf) {
      window.cancelAnimationFrame(raf)
      raf = 0
    }
    forceSyncPending = false
  })

  return {
    toc,
    activeHeadingId,
    resetTocState,
    refreshArticleDecorations,
    scrollToHeading,
  }
}
