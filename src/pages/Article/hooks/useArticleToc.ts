import { setupLazyImage } from '@/directives/vLazy'
import { Icon } from '@iconify/vue'
import { createApp, defineComponent, h, onMounted, onUnmounted, ref } from 'vue'
import type { TocItem } from '../types'

type Heading = { id: string; text: string; level: number; el: HTMLElement }

const canUseDOM = typeof window !== 'undefined'
const SELECTOR = '.markdown-content h1, .markdown-content h2, .markdown-content h3'
const GAP = 16

export const useArticleToc = () => {
  const toc = ref<TocItem[]>([])
  const activeHeadingId = ref('')
  let headings: Heading[] = []
  let raf = 0
  let forceSync = false
  const getConnectedHeadings = () => headings.filter((h) => h.el.isConnected)

  const normalizeText = (text: string) =>
    text
      .replace(/^[\d.]+\s+/, '')
      .replace(/\s+/g, ' ')
      .trim()

  const getOffset = () => {
    if (!canUseDOM) return 0
    const bar = document.querySelector('.Layout .topBar')
    const height =
      bar instanceof HTMLElement
        ? bar.getBoundingClientRect().height
        : Number.parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--layout-topbar-height'),
          ) || 0
    return height + GAP
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

  const getHashId = () => (canUseDOM ? decodeHash(window.location.hash) : '')

  const updateHash = (id: string) => {
    if (!canUseDOM) return
    const current = getHashId()
    if (current === id) return
    const url = id
      ? `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`
      : `${window.location.pathname}${window.location.search}`
    window.history.replaceState(window.history.state, '', url)
  }

  const isBottom = () =>
    canUseDOM &&
    window.scrollY + window.innerHeight >=
      Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0) - 2

  const getActiveId = () => {
    if (!canUseDOM || !headings.length) return ''
    const connectedHeadings = getConnectedHeadings()
    if (!connectedHeadings.length) return ''
    if (isBottom()) return connectedHeadings[connectedHeadings.length - 1]?.id || ''
    const target = window.scrollY + getOffset()
    let id = connectedHeadings[0]?.id || ''
    for (const h of connectedHeadings) {
      if (h.el.getBoundingClientRect().top + window.scrollY <= target) {
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
    if (!canUseDOM) return
    if (force) forceSync = true
    if (raf) return
    raf = requestAnimationFrame(() => {
      const f = forceSync
      raf = 0
      forceSync = false
      syncActive(f)
    })
  }

  const handleHashChange = () => {
    if (!canUseDOM || !headings.length) return
    const id = getHashId()
    if (id && getConnectedHeadings().some((h) => h.id === id)) {
      activeHeadingId.value = id
    } else {
      scheduleSync(true)
    }
  }

  const refreshToc = () => {
    if (!canUseDOM) return
    const nodes = Array.from(document.querySelectorAll(SELECTOR))
    headings = nodes
      .filter((n): n is HTMLElement => n instanceof HTMLElement)
      .map((el, i) => {
        const level = Number.parseInt(el.tagName[1] ?? '1', 10)
        const text = normalizeText(el.textContent || '')
        const id = el.id || `heading-${i}`
        if (!el.id) el.id = id
        return { id, text, level, el }
      })
    toc.value = headings.map(({ id, text, level }) => ({ id, text, level }))

    if (!headings.length) {
      activeHeadingId.value = ''
      updateHash('')
      return
    }

    const hashId = getHashId()
    if (hashId && headings.some((h) => h.id === hashId)) {
      activeHeadingId.value = hashId
    } else {
      scheduleSync(true)
    }
  }

  const CopyButton = defineComponent({
    props: { text: { type: String, required: true } },
    setup(props) {
      const copied = ref(false)
      let timer: number | undefined

      const copy = async () => {
        if (!props.text) return
        try {
          await navigator.clipboard.writeText(props.text)
        } catch {
          const ta = document.createElement('textarea')
          ta.value = props.text
          ta.style.cssText = 'position:fixed;top:-9999px'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        }
        copied.value = true
        if (timer) clearTimeout(timer)
        timer = window.setTimeout(() => (copied.value = false), 1600)
      }

      return () =>
        h(
          'button',
          {
            type: 'button',
            class: ['code-copy', { 'is-copied': copied.value }],
            onClick: copy,
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

  const enhanceCode = () => {
    if (!canUseDOM) return
    Array.from(document.querySelectorAll('.markdown-content pre'))
      .filter(
        (b): b is HTMLElement => b instanceof HTMLElement && b.dataset.codeEnhanced !== 'true',
      )
      .forEach((block) => {
        const code = block.querySelector('code')
        if (!(code instanceof HTMLElement)) return
        const mount = document.createElement('div')
        mount.className = 'code-copy-mount'
        block.appendChild(mount)
        createApp(CopyButton, { text: code.textContent || '' }).mount(mount)
        block.dataset.codeEnhanced = 'true'
      })
  }

  const enhanceImages = () => {
    if (!canUseDOM) return
    Array.from(document.querySelectorAll('.markdown-content img'))
      .filter(
        (img): img is HTMLImageElement =>
          img instanceof HTMLImageElement && !img.dataset.lazyEnhanced,
      )
      .forEach((img) => {
        const originalSrc = img.src || img.getAttribute('src')
        if (!originalSrc) return
        img.dataset.lazyEnhanced = 'true'
        img.setAttribute('data-original-src', originalSrc)
        img.removeAttribute('src')
        setupLazyImage(img, originalSrc)
      })
  }

  const resetTocState = () => {
    if (canUseDOM && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
    toc.value = []
    activeHeadingId.value = ''
    headings = []
    forceSync = false
  }

  const refreshArticleDecorations = () => {
    enhanceImages()
    enhanceCode()
    refreshToc()
  }

  const scrollToHeading = (id: string) => {
    if (!canUseDOM) return
    const el = document.getElementById(id)
    if (!el) return
    activeHeadingId.value = id
    updateHash(id)
    const top = el.getBoundingClientRect().top + window.scrollY - getOffset() + 1
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  const handleScroll = () => scheduleSync()
  const handleResize = () => scheduleSync(true)

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
    resetTocState()
  })

  return { toc, activeHeadingId, resetTocState, refreshArticleDecorations, scrollToHeading }
}
