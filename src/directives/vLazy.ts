import type { Directive } from 'vue'

type LazyImageEl = HTMLImageElement & {
  __vLazyCleanup?: () => void
}

const schedule = (cb: FrameRequestCallback) => {
  if (typeof window === 'undefined') return
  const raf = window.requestAnimationFrame?.bind(window)
  if (raf) {
    raf(cb)
  } else {
    window.setTimeout(cb, 0)
  }
}

const setLoadingStyles = (el: LazyImageEl) => {
  if (el.dataset.vLazyStyled === '1') return
  el.style.opacity = '0'
  el.style.filter = 'blur(20px)'
  el.style.transition = 'opacity 0.6s ease, filter 0.6s ease'
  el.dataset.vLazyStyled = '1'
}

const setLoadedStyles = (el: LazyImageEl) => {
  el.style.opacity = '1'
  el.style.filter = 'blur(0px)'
}

const createObserver = (el: LazyImageEl, loadImage: () => void) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    loadImage()
    return null
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadImage()
        obs.disconnect()
      }
    },
    { rootMargin: '0px 0px 200px 0px' }
  )

  observer.observe(el)
  return observer
}

export const setupLazyImage = (el: HTMLImageElement, src: string): (() => void) => {
  const lazyEl = el as LazyImageEl
  if (!src) return () => {}

  setLoadingStyles(lazyEl)

  if (lazyEl.complete && lazyEl.naturalWidth > 0 && lazyEl.currentSrc === src) {
    schedule(() => setLoadedStyles(lazyEl))
    return () => {}
  }

  const onLoad = () => setLoadedStyles(lazyEl)
  const loadImage = () => {
    if (lazyEl.src !== src) lazyEl.src = src
  }

  lazyEl.addEventListener('load', onLoad, { once: true })

  const observer = createObserver(lazyEl, loadImage)

  return () => {
    observer?.disconnect()
    lazyEl.removeEventListener('load', onLoad)
  }
}

const resolveLazySrc = (el: LazyImageEl, binding: { value: unknown }) => {
  if (typeof binding.value === 'string' && binding.value.trim()) {
    return binding.value
  }
  const dataSrc = el.getAttribute('data-src')
  return dataSrc ? dataSrc.trim() : ''
}

export const vLazy: Directive<LazyImageEl, string | boolean> = {
  mounted(el, binding) {
    const src = resolveLazySrc(el, binding)
    if (!src) return

    el.__vLazyCleanup = setupLazyImage(el, src)
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    const src = resolveLazySrc(el, binding)
    if (!src) return

    if (el.__vLazyCleanup) {
      el.__vLazyCleanup()
    }
    el.__vLazyCleanup = setupLazyImage(el, src)
  },
  unmounted(el) {
    if (el.__vLazyCleanup) {
      el.__vLazyCleanup()
    }
  },
}
