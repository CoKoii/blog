<script setup lang="ts">
import { consumeScroll } from '@/router/utils/scroll'
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
  const { left = 0, top = 0 } = consumeScroll()
  window.scrollTo({ left, top, behavior: 'auto' })
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
@use '@/styles/transitions.scss';

.main {
  position: relative;
}
</style>
