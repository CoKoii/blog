<script setup lang="ts">
import { commentsConfig } from '@/config'
import Giscus from '@giscus/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const giscus = commentsConfig.giscus
const repo = giscus.repo as `${string}/${string}`
const strict: '0' | '1' = giscus.strict ? '1' : '0'
const reactionsEnabled: '0' | '1' = giscus.reactionsEnabled ? '1' : '0'
const emitMetadata: '0' | '1' = giscus.emitMetadata ? '1' : '0'
const term =
  giscus.mapping === 'specific' || giscus.mapping === 'number'
    ? giscus.term || undefined
    : undefined
</script>

<template>
  <section class="GiscusComments" aria-label="评论区">
    <div class="header">
      <h3 class="title">评论区</h3>
      <p class="desc">欢迎在评论区交流文章内容</p>
    </div>
    <div class="body">
      <Giscus
        :key="route.path"
        :host="giscus.host || undefined"
        :repo="repo"
        :repo-id="giscus.repoId"
        :category="giscus.category"
        :category-id="giscus.categoryId"
        :mapping="giscus.mapping"
        :term="term"
        :strict="strict"
        :reactions-enabled="reactionsEnabled"
        :emit-metadata="emitMetadata"
        :input-position="giscus.inputPosition"
        :theme="giscus.theme"
        :lang="giscus.lang"
        :loading="giscus.loading"
      />
    </div>
  </section>
</template>

<style scoped lang="scss" src="./style.scss"></style>
