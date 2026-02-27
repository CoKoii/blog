<script setup lang="ts">
import CommentBubbles from '@/components/Comments/CommentBubbles.vue'
import GiscusComments from '@/components/Comments/GiscusComments.vue'
import { isGiscusReady } from '@/config'
import { Icon } from '@iconify/vue'
import type { Component } from 'vue'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { TocItem } from '../types'

const { contentComponent, toc, activeHeadingId, loading, onScrollToHeading } = defineProps<{
  contentComponent: Component | null
  toc: TocItem[]
  activeHeadingId: string
  loading: boolean
  onScrollToHeading: (id: string) => void
}>()

const tocRef = ref<HTMLElement | null>(null)
let rafId = 0
const SCROLL_EDGE_GAP = 18
const SMOOTH_SCROLL_DISTANCE = 56

const scrollActiveIntoView = (id: string) => {
  if (!id || !tocRef.value) return
  const container = tocRef.value
  const el = container.querySelector<HTMLElement>(`[href="#${CSS.escape(id)}"]`)
  if (!el) return

  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    rafId = 0
    const elTop = el.offsetTop
    const elBottom = elTop + el.offsetHeight
    const viewTop = container.scrollTop + SCROLL_EDGE_GAP
    const viewBottom = container.scrollTop + container.clientHeight - SCROLL_EDGE_GAP

    // 还在可视区内就不滚动，避免连续重启 smooth scroll 导致视觉卡顿。
    if (elTop >= viewTop && elBottom <= viewBottom) return

    const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight)
    const targetTop = Math.min(
      Math.max(elTop - (container.clientHeight - el.offsetHeight) / 2, 0),
      maxScroll,
    )
    const distance = Math.abs(container.scrollTop - targetTop)
    container.scrollTo({
      top: targetTop,
      behavior: distance > SMOOTH_SCROLL_DISTANCE ? 'smooth' : 'auto',
    })
  })
}

watch(
  () => activeHeadingId,
  (id) => {
    if (!id) return
    nextTick(() => scrollActiveIntoView(id))
  },
)
onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div class="content" :class="{ is_skeleton: loading }">
    <div class="main">
      <article class="article markdown-content">
        <component v-if="!loading && contentComponent" :is="contentComponent" />
      </article>
      <CommentBubbles v-if="!loading && isGiscusReady" />
      <GiscusComments v-if="!loading && isGiscusReady" />
    </div>
    <aside class="menus">
      <div class="toc" v-if="loading"></div>
      <div class="toc" v-else-if="toc.length">
        <div class="toc_header">
          <Icon icon="lucide:align-justify" class="toc_icon" />
          <span class="toc_title">目录</span>
        </div>
        <div ref="tocRef" class="toc_body">
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
      </div>
    </aside>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
