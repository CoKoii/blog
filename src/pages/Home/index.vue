<script setup lang="ts">
import { useHead } from '@vueuse/head'
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
    <input type="text" />
    <h1 v-for="item in 50" :key="item">home{{ item }}</h1>
  </div>
</template>

<style scoped lang="scss"></style>
