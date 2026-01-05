import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  // 桌面端侧边栏状态
  const isSideBarOpen = ref(true)
  //移动端侧边栏状态
  const isMobileSideBarOpen = ref(false)
  // 改变桌面端侧边栏状态
  const toggleSideBar = () => {
    //判断设备宽度,各种宽度做什么处理
    const screenWidth = window.innerWidth
    // 移动端尺寸
    if (screenWidth <= 768) {
      isMobileSideBarOpen.value = !isMobileSideBarOpen.value
      return
      // 平板尺寸
    } else if (screenWidth > 768 && screenWidth <= 1024) {
      isSideBarOpen.value = true
      return
      // 桌面端尺寸
    } else {
      isSideBarOpen.value = !isSideBarOpen.value
    }
  }
  return { isSideBarOpen, isMobileSideBarOpen, toggleSideBar }
})
