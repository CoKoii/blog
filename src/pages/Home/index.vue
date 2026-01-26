<script setup lang="ts">
import CenterCard from './CenterCard/index.vue'
import TopCard from './TopCard/index.vue'
import { useHomeHead } from './utils'

useHomeHead()
</script>

<template>
  <div class="Home">
    <TopCard />
    <CenterCard />
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
