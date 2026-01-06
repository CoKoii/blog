<script setup lang="ts">
import { useHead } from '@vueuse/head'
import TopCard from './TopCard/TopCard.vue'
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
  <div class="index">
    <TopCard />
  </div>
</template>

<style scoped lang="scss"></style>
