import { setupLazyImage } from '@/directives/vLazy'
import { Icon } from '@iconify/vue'
import { createApp, defineComponent, h, ref } from 'vue'

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
  Array.from(document.querySelectorAll('.markdown-content pre'))
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

const enhanceLinks = () => {
  Array.from(document.querySelectorAll('.markdown-content a'))
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

export const refreshArticleDecorations = () => {
  enhanceLinks()
  enhanceImages()
  enhanceCode()
}
