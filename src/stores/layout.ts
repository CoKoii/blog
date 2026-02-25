import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  type Mode = 'large' | 'medium' | 'small'
  const BP = { small: 768, medium: 1024 } as const

  const isSideBarOpen = ref(true)
  const isMobileSideBarOpen = ref(false)
  const mode = ref<Mode>('large')

  const getMode = (w: number): Mode =>
    w <= BP.small ? 'small' : w <= BP.medium ? 'medium' : 'large'

  const applyMode = (m: Mode) => {
    mode.value = m
    isMobileSideBarOpen.value = false
    isSideBarOpen.value = m === 'large'
  }

  const syncSideBarByWidth = () => {
    if (typeof window === 'undefined') return
    const m = getMode(window.innerWidth)
    if (m !== mode.value) applyMode(m)
  }

  const toggleSideBar = () => {
    if (typeof window === 'undefined') return
    const w = window.innerWidth
    if (w <= BP.small) {
      isMobileSideBarOpen.value = !isMobileSideBarOpen.value
    } else if (w > BP.medium) {
      isSideBarOpen.value = !isSideBarOpen.value
    }
  }

  return { isSideBarOpen, isMobileSideBarOpen, toggleSideBar, syncSideBarByWidth }
})
