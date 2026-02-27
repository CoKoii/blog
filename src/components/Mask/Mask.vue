<script setup lang="ts">
import { useLayoutStore } from '@/store/layout'
import { onUnmounted, watch } from 'vue'

const layoutStore = useLayoutStore()
const prevent = (e: Event) => e.preventDefault()
const canUseDOM = typeof document !== 'undefined'

watch(
  () => layoutStore.isMobileSideBarOpen,
  (open) => {
    if (!canUseDOM) return
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      document.addEventListener('touchmove', prevent, { passive: false })
    } else {
      document.removeEventListener('touchmove', prevent)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (!canUseDOM) return
  document.body.style.overflow = ''
  document.removeEventListener('touchmove', prevent)
})
</script>

<template>
  <Transition name="fade">
    <div
      class="Mask"
      v-if="layoutStore.isMobileSideBarOpen"
      @click="layoutStore.toggleSideBar"
    ></div>
  </Transition>
</template>

<style scoped lang="scss">
.Mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
