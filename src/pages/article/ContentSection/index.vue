<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Component } from 'vue'
import type { TocItem } from '../types'

const props = defineProps<{
  contentComponent: Component | null
  toc: TocItem[]
  activeHeadingId: string
  loading: boolean
  onScrollToHeading: (id: string) => void
}>()
</script>

<template>
  <div class="content" :class="{ is_skeleton: props.loading }">
    <article class="article markdown-content">
      <component v-if="!props.loading && props.contentComponent" :is="props.contentComponent" />
    </article>
    <aside class="menus">
      <div class="toc" v-if="props.loading"></div>
      <div class="toc" v-else-if="props.toc.length > 0">
        <div class="toc_header">
          <Icon icon="lucide:align-justify" class="toc_icon" />
          <span class="toc_title">目录</span>
        </div>
        <nav class="toc_nav">
          <a
            v-for="item in props.toc"
            :key="item.id"
            :class="[
              'toc_item',
              `toc_level_${item.level}`,
              { active: props.activeHeadingId === item.id },
            ]"
            @click.prevent="props.onScrollToHeading(item.id)"
            :href="`#${item.id}`"
          >
            {{ item.text }}
          </a>
        </nav>
      </div>
    </aside>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
