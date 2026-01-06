<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
const layoutStore = useLayoutStore()
defineOptions({
  name: 'MobileSideBar',
})
</script>

<template>
  <Transition name="fade">
    <div class="MobileSideBar" v-if="layoutStore.isMobileSideBarOpen">
      <h1>Mobile Side Bar</h1>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use './style.scss';
.fade-enter-active,
.fade-leave-active {
  transition: transform 0.3s 100ms;
}
.fade-enter-from,
.fade-leave-to {
  transform: translateX(-100%);
}
</style>
