import type { LazyEl, LazySource } from '@/types/lazy'
import type { Directive } from 'vue'

const schedule = (cb: FrameRequestCallback) => {
  if (typeof window === 'undefined') return
  if (window.requestAnimationFrame) return window.requestAnimationFrame(cb)
  window.setTimeout(cb, 0)
}

const setLoading = (el: LazyEl) => {
  if (el.dataset.lazy === '1') return
  Object.assign(el.style, {
    opacity: '0',
    transform: 'scale(1.02)',
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    willChange: 'opacity, transform',
  })
  el.dataset.lazy = '1'
}

const setLoaded = (el: LazyEl) => {
  el.style.opacity = '1'
  el.style.transform = 'none'
  el.style.willChange = 'auto'
}

const createObs = (el: LazyEl, load: () => void) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    load()
    return null
  }

  const obs = new IntersectionObserver(
    (entries, o) => {
      if (entries.some((e) => e.isIntersecting)) {
        load()
        o.disconnect()
      }
    },
    { rootMargin: '0px 0px 200px 0px' },
  )

  obs.observe(el)
  return obs
}

const applySource = (el: LazyEl, source: LazySource) => {
  if (source.srcset) el.srcset = source.srcset
  else el.removeAttribute('srcset')

  if (source.sizes) el.sizes = source.sizes
  else el.removeAttribute('sizes')

  if (el.src !== source.src) el.src = source.src
}

export const setupLazyImage = (el: HTMLImageElement, source: LazySource) => {
  const lazy = el as LazyEl
  if (!source.src) return () => {}

  if (
    lazy.complete &&
    lazy.naturalWidth > 0 &&
    (lazy.currentSrc === source.src || lazy.src === source.src || (!!source.srcset && !!lazy.currentSrc))
  ) {
    schedule(() => setLoaded(lazy))
    return () => {}
  }

  setLoading(lazy)

  const onLoad = () => setLoaded(lazy)
  const load = () => applySource(lazy, source)

  lazy.addEventListener('load', onLoad, { once: true })
  const obs = createObs(lazy, load)

  return () => {
    obs?.disconnect()
    lazy.removeEventListener('load', onLoad)
  }
}

const getSource = (el: LazyEl, binding: { value: unknown }): LazySource | null => {
  if (typeof binding.value === 'string' && binding.value.trim()) return { src: binding.value.trim() }

  if (
    binding.value &&
    typeof binding.value === 'object' &&
    'src' in binding.value &&
    typeof binding.value.src === 'string' &&
    binding.value.src.trim()
  ) {
    const srcset =
      'srcset' in binding.value && typeof binding.value.srcset === 'string'
        ? binding.value.srcset.trim()
        : ''
    const sizes =
      'sizes' in binding.value && typeof binding.value.sizes === 'string'
        ? binding.value.sizes.trim()
        : ''

    return {
      src: binding.value.src.trim(),
      ...(srcset ? { srcset } : {}),
      ...(sizes ? { sizes } : {}),
    }
  }

  const src = el.getAttribute('data-src')?.trim() ?? ''
  return src ? { src } : null
}

export const vLazy: Directive<LazyEl, string | LazySource | boolean> = {
  mounted(el, binding) {
    const source = getSource(el, binding)
    if (source) el.__cleanup = setupLazyImage(el, source)
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    const source = getSource(el, binding)
    if (!source) return
    el.__cleanup?.()
    el.__cleanup = setupLazyImage(el, source)
  },
  unmounted(el) {
    el.__cleanup?.()
  },
}
