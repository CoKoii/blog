<script setup lang="ts">
import GiscusComments from '@/components/Comments/GiscusComments.vue'
import { isGiscusReady } from '@/config'
import { Icon } from '@iconify/vue'
import type { Component } from 'vue'
import type { TocItem } from '../types'

const { contentComponent, toc, activeHeadingId, loading, onScrollToHeading } = defineProps<{
  contentComponent: Component | null
  toc: TocItem[]
  activeHeadingId: string
  loading: boolean
  onScrollToHeading: (id: string) => void
}>()
</script>

<template>
  <div class="content" :class="{ is_skeleton: loading }">
    <div class="main">
      <article class="article markdown-content">
        <component v-if="!loading && contentComponent" :is="contentComponent" />
      </article>
      <GiscusComments v-if="!loading && isGiscusReady" />
    </div>
    <aside class="menus">
      <div class="toc" v-if="loading"></div>
      <div class="toc" v-else-if="toc.length">
        <div class="toc_header">
          <Icon icon="lucide:align-justify" class="toc_icon" />
          <span class="toc_title">目录</span>
        </div>
        <nav class="toc_nav">
          <a
            v-for="item in toc"
            :key="item.id"
            :class="[
              'toc_item',
              `toc_level_${item.level}`,
              { active: activeHeadingId === item.id },
            ]"
            @click.prevent="onScrollToHeading(item.id)"
            :href="`#${item.id}`"
            >{{ item.text }}</a
          >
        </nav>
      </div>
    </aside>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
