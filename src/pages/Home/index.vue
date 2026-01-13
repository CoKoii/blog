<script setup lang="ts">
import { useHead } from '@vueuse/head'
import TopCard from './TopCard/TopCard.vue'
import CenterCard from './CenterCard/CenterCard.vue'
useHead({
  title: 'CaoKai - 技术博客',
  meta: [
    {
      name: 'description',
      content: '专注前端、SSG、Vue、工程化实践等技术领域的分享',
    },
  ],
})
</script>

<template>
  <div class="Home">
    <TopCard />
    <CenterCard />
  </div>
</template>

<style scoped lang="scss">
.Home {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
