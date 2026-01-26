<template>
  <router-view v-slot="{ Component }">
    <transition name="zoomBlur" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style scoped lang="scss">
.zoomBlur-enter-active {
  transition: opacity 0.18s ease;
  will-change: opacity;
}

.zoomBlur-enter-from {
  opacity: 0;
}

.zoomBlur-enter-to {
  opacity: 1;
}

.zoomBlur-leave-active {
  transition:
    transform 0.24s ease,
    opacity 0.24s ease,
    filter 0.24s ease;
  will-change: transform, opacity, filter;
}

.zoomBlur-leave-from {
  transform: translateY(0);
  opacity: 1;
  filter: blur(0);
}

.zoomBlur-leave-to {
  transform: translateY(var(--space-2));
  opacity: 0;
  filter: blur(var(--blur-lg));
}
</style>
