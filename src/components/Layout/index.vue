<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import TopBar from './TopBar/index.vue'
import SideBar from './SideBar/index.vue'
import Footer from './Footer/index.vue'
import { useLayoutStore } from '@/stores/layout'
import Mask from '../Mask/Mask.vue'
import MobileSideBar from './MobileSideBar/MobileSideBar.vue'
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
    <Teleport to="body">
      <MobileSideBar />
    </Teleport>
    <Mask></Mask>
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
        <router-view v-slot="{ Component }">
          <transition name="zoomBlur" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
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

/* 可选：只让 main 区域承担动画，避免影响整个 Layout */
.main {
  position: relative;
}

/* 进入：简单淡入 */
:deep(.zoomBlur-enter-active) {
  transition: opacity 160ms ease;
  will-change: opacity;
}
:deep(.zoomBlur-enter-from) {
  opacity: 0;
}
:deep(.zoomBlur-enter-to) {
  opacity: 1;
}

/* 离开：放大 + 透明 + 模糊 */
:deep(.zoomBlur-leave-active) {
  transition:
    transform 220ms ease,
    opacity 220ms ease,
    filter 220ms ease;
  will-change: transform, opacity, filter;
}

:deep(.zoomBlur-leave-from) {
  transform: scale(1);
  opacity: 1;
  filter: blur(0px);
}

:deep(.zoomBlur-leave-to) {
  transform: scale(1.04);
  opacity: 0;
  filter: blur(10px);
}
</style>
