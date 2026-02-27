import type { LayoutMode } from '@/types/layout'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  const BP = { small: 768, medium: 1024 } as const

  const isSideBarOpen = ref(true)
  const isMobileSideBarOpen = ref(false)
  const mode = ref<LayoutMode>('large')

  const getMode = (w: number): LayoutMode =>
    w <= BP.small ? 'small' : w <= BP.medium ? 'medium' : 'large'

  const applyMode = (m: LayoutMode) => {
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
    if (mode.value === 'small') {
      isMobileSideBarOpen.value = !isMobileSideBarOpen.value
      return
    }
    if (mode.value === 'large') isSideBarOpen.value = !isSideBarOpen.value
  }

  return { isSideBarOpen, isMobileSideBarOpen, toggleSideBar, syncSideBarByWidth }
})
