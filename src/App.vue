<template>
  <router-view v-slot="{ Component }">
    <transition name="zoomBlur" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style src="@/styles/transitions.scss"></style>
