import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  type ScreenMode = 'large' | 'medium' | 'small'
  // 桌面端侧边栏状态
  const isSideBarOpen = ref(true)
  //移动端侧边栏状态
  const isMobileSideBarOpen = ref(false)
  const screenMode = ref<ScreenMode | null>(null)

  const getScreenMode = (width: number): ScreenMode => {
    if (width <= 768) return 'small'
    if (width <= 1024) return 'medium'
    return 'large'
  }

  const applyScreenMode = (mode: ScreenMode) => {
    screenMode.value = mode
    if (mode === 'large') {
      isSideBarOpen.value = true
      isMobileSideBarOpen.value = false
      return
    }
    if (mode === 'medium') {
      isSideBarOpen.value = false
      isMobileSideBarOpen.value = false
      return
    }
    isSideBarOpen.value = false
    isMobileSideBarOpen.value = false
  }

  const syncSideBarByWidth = () => {
    const mode = getScreenMode(window.innerWidth)
    if (mode !== screenMode.value) {
      applyScreenMode(mode)
    }
  }

  // 改变桌面端侧边栏状态
  const toggleSideBar = () => {
    //判断设备宽度,各种宽度做什么处理
    const screenWidth = window.innerWidth
    // 移动端尺寸
    if (screenWidth <= 768) {
      console.log('小屏幕侧边栏隐藏')
      return
      // 平板尺寸
    } else if (screenWidth > 768 && screenWidth <= 1024) {
      console.log('移动端侧边栏出现')
      return
      // 桌面端尺寸
    } else {
      isSideBarOpen.value = !isSideBarOpen.value
    }
  }
  return { isSideBarOpen, isMobileSideBarOpen, toggleSideBar, syncSideBarByWidth }
})
