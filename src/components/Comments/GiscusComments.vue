<script setup lang="ts">
import { commentsConfig } from '@/config'
import Giscus from '@giscus/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const giscus = commentsConfig.giscus
const { mapping } = giscus
const repo = giscus.repo as `${string}/${string}`
const mapBool = (value: boolean): '0' | '1' => (value ? '1' : '0')
const strict = mapBool(giscus.strict)
const reactionsEnabled = mapBool(giscus.reactionsEnabled)
const emitMetadata = mapBool(giscus.emitMetadata)
const term = mapping === 'specific' || mapping === 'number' ? giscus.term : undefined
</script>

<template>
  <section id="giscus-comments" class="GiscusComments" aria-label="评论区">
    <div class="header">
      <h3 class="title">评论区</h3>
      <p class="desc">欢迎在评论区交流文章内容</p>
    </div>
    <div class="body">
      <Giscus
        :key="route.path"
        :host="giscus.host ?? undefined"
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
