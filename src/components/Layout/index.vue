<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import TopBar from './TopBar/index.vue'
import SideBar from './SideBar/index.vue'
import Footer from './Footer/index.vue'
import { useLayoutStore } from '@/stores/layout'
import Mask from '../Mask/Mask.vue'
const layoutStore = useLayoutStore()

const handleResize = () => {
  layoutStore.syncSideBarByWidth()
}

onMounted(() => {
  layoutStore.syncSideBarByWidth()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="Layout" :class="{ collapse: !layoutStore.isSideBarOpen }">
    <Mask :show="layoutStore.isMobileSideBarOpen"></Mask>
    <!-- 顶部栏 -->
    <div class="topBar">
      <TopBar />
    </div>
    <!-- 主容器 -->
    <div class="content">
      <!-- 侧边栏 -->
      <div class="sideBar">
        <SideBar />
      </div>
      <!-- 内容区 -->
      <div class="main">
        <router-view />
        <!-- 页脚 -->
        <div class="footer">
          <Footer />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './style.scss';
</style>
