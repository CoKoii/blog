import { setupLazyImage } from '@/directives/vLazy'
import { Icon } from '@/components/Icon'
import { createApp, defineComponent, h, ref } from 'vue'

const queryAll = <T extends Element>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector))

const DEFAULT_IMAGE_RATIO = '16 / 10'
const WORDISH_RE = /[\p{Script=Han}\p{L}\p{N}]/u
const INLINE_SPACE_RE = /[\s\u200B\u200C\u200D\uFEFF]/u

const toRatio = (width: number, height: number) => `${width} / ${height}`

const isPositive = (value: number) => Number.isFinite(value) && value > 0

const getBoundaryState = (text: string, direction: 'before' | 'after') => {
  const chars = Array.from(text)
  const orderedChars = direction === 'before' ? chars.reverse() : chars

  for (const char of orderedChars) {
    if (INLINE_SPACE_RE.test(char)) {
      return { char: '', hasSpace: true }
    }

    return { char, hasSpace: false }
  }

  return { char: '', hasSpace: false }
}

const getAdjacentInlineState = (node: ChildNode | null, direction: 'before' | 'after') => {
  let current = node

  while (current) {
    if (current.nodeType === Node.TEXT_NODE || current.nodeType === Node.ELEMENT_NODE) {
      const text = current.textContent ?? ''
      const state = getBoundaryState(text, direction)

      if (state.char || state.hasSpace) {
        return state
      }
    }

    current = direction === 'before' ? current.previousSibling : current.nextSibling
  }

  return { char: '', hasSpace: false }
}

const getRatioFromAttributes = (img: HTMLImageElement) => {
  const width = Number.parseFloat(img.getAttribute('width') || '')
  const height = Number.parseFloat(img.getAttribute('height') || '')
  return isPositive(width) && isPositive(height) ? toRatio(width, height) : null
}

const applyRatio = (img: HTMLImageElement, ratio: string | null) => {
  img.style.setProperty('--md-image-aspect-ratio', ratio || DEFAULT_IMAGE_RATIO)
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
  queryAll<HTMLElement>('.markdown-content pre')
    .filter((b): b is HTMLElement => b instanceof HTMLElement && b.dataset.codeEnhanced !== 'true')
    .forEach((block) => {
      const code = block.querySelector('code')
      if (!(code instanceof HTMLElement)) return
      const mount = document.createElement('div')
      mount.className = 'code-copy-mount'
      block.appendChild(mount)
      createApp(CopyButton, { text: code.textContent ?? '' }).mount(mount)
      block.dataset.codeEnhanced = 'true'
    })
}

const enhanceImages = () => {
  queryAll<HTMLImageElement>('.markdown-content img')
    .filter(
      (img): img is HTMLImageElement =>
        img instanceof HTMLImageElement && !img.dataset.lazyEnhanced,
    )
    .forEach((img) => {
      const originalSrc = img.src || img.getAttribute('src')
      if (!originalSrc) return

      const attrRatio = getRatioFromAttributes(img)
      applyRatio(img, attrRatio)

      const syncRatioFromNaturalSize = () => {
        if (!isPositive(img.naturalWidth) || !isPositive(img.naturalHeight)) return
        const ratio = toRatio(img.naturalWidth, img.naturalHeight)
        applyRatio(img, ratio)
      }

      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        syncRatioFromNaturalSize()
      } else {
        img.addEventListener('load', syncRatioFromNaturalSize, { once: true })
      }

      img.dataset.lazyEnhanced = 'true'
      img.setAttribute('data-original-src', originalSrc)
      img.removeAttribute('src')
      setupLazyImage(img, { src: originalSrc })
    })
}

const enhanceLinks = () => {
  queryAll<HTMLAnchorElement>('.markdown-content a')
    .filter((link): link is HTMLAnchorElement => link instanceof HTMLAnchorElement)
    .forEach((link) => {
      const href = (link.getAttribute('href') ?? '').trim()
      if (!href || href.startsWith('#')) return
      link.setAttribute('target', '_blank')
      const rel = (link.getAttribute('rel') ?? '').trim()
      const relSet = new Set(rel.split(/\s+/).filter(Boolean))
      relSet.add('noopener')
      relSet.add('noreferrer')
      link.setAttribute('rel', Array.from(relSet).join(' '))
    })
}

const enhanceStrongSpacing = () => {
  queryAll<HTMLElement>('.markdown-content strong').forEach((strong) => {
    const before = getAdjacentInlineState(strong.previousSibling, 'before')
    const after = getAdjacentInlineState(strong.nextSibling, 'after')
    const needsGapBefore = !before.hasSpace && WORDISH_RE.test(before.char)
    const needsGapAfter = !after.hasSpace && WORDISH_RE.test(after.char)

    strong.toggleAttribute('data-md-gap-before', needsGapBefore)
    strong.toggleAttribute('data-md-gap-after', needsGapAfter)
  })
}

export const refreshArticleDecorations = () => {
  enhanceStrongSpacing()
  enhanceLinks()
  enhanceImages()
  enhanceCode()
}
