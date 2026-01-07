<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { useLayoutStore } from '@/stores/layout'
const layoutStore = useLayoutStore()
const preventDefault = (e: Event) => {
  e.preventDefault()
}

watch(
  () => layoutStore.isMobileSideBarOpen,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('touchmove', preventDefault, { passive: false })
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('touchmove', preventDefault)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('touchmove', preventDefault)
})
</script>

<template>
  <Transition name="fade">
    <div
      class="Mask"
      v-if="layoutStore.isMobileSideBarOpen"
      @click="layoutStore.toggleSideBar()"
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
