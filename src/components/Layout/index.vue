<script setup lang="ts">
import { consumeScroll } from '@/router/scroll'
import { useLayoutStore } from '@/stores/layout'
import { onBeforeUnmount, onMounted } from 'vue'
import Mask from '../Mask/Mask.vue'
import MobileSideBar from './MobileSideBar/MobileSideBar.vue'
import SideBar from './SideBar/index.vue'
import TopBar from './TopBar/index.vue'

const layoutStore = useLayoutStore()

const handleResize = () => layoutStore.syncSideBarByWidth()

onMounted(() => {
  layoutStore.syncSideBarByWidth()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => window.removeEventListener('resize', handleResize))

const handleBeforeEnter = () => {
  const pos = consumeScroll()
  window.scrollTo({ left: pos.left ?? 0, top: pos.top ?? 0, behavior: 'auto' })
}
</script>

<template>
  <div class="Layout" :class="{ collapse: !layoutStore.isSideBarOpen }">
    <Teleport to="body">
      <MobileSideBar />
    </Teleport>
    <Mask />
    <div class="topBar">
      <TopBar />
    </div>
    <div class="content">
      <div class="sideBar">
        <SideBar />
      </div>
      <div class="main">
        <router-view v-slot="{ Component }">
          <transition name="zoomBlur" mode="out-in" @before-enter="handleBeforeEnter">
            <component :is="Component" />
          </transition>
        </router-view>
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

/* 离开：轻微下移 + 透明 + 模糊 */
:deep(.zoomBlur-leave-active) {
  transition:
    transform 220ms ease,
    opacity 220ms ease,
    filter 220ms ease;
  will-change: transform, opacity, filter;
}

:deep(.zoomBlur-leave-from) {
  transform: translateY(0);
  opacity: 1;
  filter: blur(0);
}

:deep(.zoomBlur-leave-to) {
  transform: translateY(var(--space-2));
  opacity: 0;
  filter: blur(var(--blur-lg));
}
</style>
