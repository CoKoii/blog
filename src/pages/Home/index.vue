<script setup lang="ts">
import CenterCard from './CenterCard/index.vue'
import TopCard from './TopCard/index.vue'
import { useHomeHead } from './hooks/useHomeHead'

useHomeHead()
</script>

<template>
  <section class="Home">
    <TopCard />
    <CenterCard />
  </section>
</template>

<style scoped lang="scss" src="./style.scss"></style>
