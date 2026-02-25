import type { Directive } from 'vue'

type LazyEl = HTMLImageElement & { __cleanup?: () => void }

const schedule = (cb: FrameRequestCallback) => {
  if (typeof window === 'undefined') return
  const raf = window.requestAnimationFrame
  if (raf) {
    raf(cb)
  } else {
    window.setTimeout(cb, 0)
  }
}

const setLoading = (el: LazyEl) => {
  if (el.dataset.lazy === '1') return
  Object.assign(el.style, {
    opacity: '0',
    filter: 'blur(20px)',
    transition: 'opacity 0.3s ease, filter 0.3s ease',
  })
  el.dataset.lazy = '1'
}

const setLoaded = (el: LazyEl) => {
  el.style.opacity = '1'
  el.style.filter = 'blur(0px)'
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

export const setupLazyImage = (el: HTMLImageElement, src: string) => {
  const lazy = el as LazyEl
  if (!src) return () => {}

  if (lazy.complete && lazy.naturalWidth > 0 && (lazy.currentSrc === src || lazy.src === src)) {
    schedule(() => setLoaded(lazy))
    return () => {}
  }

  setLoading(lazy)

  const onLoad = () => setLoaded(lazy)
  const load = () => {
    if (lazy.src !== src) lazy.src = src
  }

  lazy.addEventListener('load', onLoad, { once: true })
  const obs = createObs(lazy, load)

  return () => {
    obs?.disconnect()
    lazy.removeEventListener('load', onLoad)
  }
}

const getSrc = (el: LazyEl, binding: { value: unknown }) => {
  if (typeof binding.value === 'string' && binding.value.trim()) return binding.value
  const ds = el.getAttribute('data-src')
  return ds ? ds.trim() : ''
}

export const vLazy: Directive<LazyEl, string | boolean> = {
  mounted(el, binding) {
    const src = getSrc(el, binding)
    if (src) el.__cleanup = setupLazyImage(el, src)
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    const src = getSrc(el, binding)
    if (!src) return
    el.__cleanup?.()
    el.__cleanup = setupLazyImage(el, src)
  },
  unmounted(el) {
    el.__cleanup?.()
  },
}
