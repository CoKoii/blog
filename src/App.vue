<template>
  <router-view v-slot="{ Component }">
    <Transition name="zoomBlur" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
</template>

<style src="@/styles/transitions.scss"></style>
