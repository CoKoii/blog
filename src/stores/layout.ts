import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  type ScreenMode = 'large' | 'medium' | 'small'
  const BREAKPOINTS = {
    smallMax: 768,
    mediumMax: 1024,
  } as const
  // 桌面端侧边栏状态
  const isSideBarOpen = ref(true)
  //移动端侧边栏状态
  const isMobileSideBarOpen = ref(false)
  const screenMode = ref<ScreenMode>('large')

  const getScreenMode = (width: number): ScreenMode => {
    if (width <= BREAKPOINTS.smallMax) return 'small'
    if (width <= BREAKPOINTS.mediumMax) return 'medium'
    return 'large'
  }

  const applyScreenMode = (mode: ScreenMode) => {
    screenMode.value = mode
    isMobileSideBarOpen.value = false
    isSideBarOpen.value = mode === 'large'
  }

  const syncSideBarByWidth = () => {
    if (typeof window === 'undefined') return
    const mode = getScreenMode(window.innerWidth)
    if (mode !== screenMode.value) {
      applyScreenMode(mode)
    }
  }

  // 改变桌面端侧边栏状态
  const toggleSideBar = () => {
    if (typeof window === 'undefined') return
    //判断设备宽度,各种宽度做什么处理
    const screenWidth = window.innerWidth
    // 移动端尺寸
    if (screenWidth <= BREAKPOINTS.smallMax) {
      isMobileSideBarOpen.value = !isMobileSideBarOpen.value
      return
      // 平板尺寸
    } else if (screenWidth <= BREAKPOINTS.mediumMax) {
      return
      // 桌面端尺寸
    } else {
      isSideBarOpen.value = !isSideBarOpen.value
    }
  }
  return { isSideBarOpen, isMobileSideBarOpen, toggleSideBar, syncSideBarByWidth }
})
