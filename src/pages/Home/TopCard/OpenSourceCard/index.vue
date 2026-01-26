<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { getRelativeTime } from '@/utils/date'
import ossData from '@/data/opensource.json'


const formatCount = (count: number) => {
  if (count < 1000) return `${count}`
  const value = count >= 10000 ? count / 1000 : Math.round((count / 1000) * 10) / 10
  return `${value}k`
}

const metaText = computed(() => {
  if (!ossData.updatedAt) return '更新于 Recently'
  return `更新于 ${getRelativeTime(ossData.updatedAt)}`
})
</script>

<template>
  <a
    class="os-card"
    aria-label="Open Source Projects"
    :href="ossData.profileUrl || '#'"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="top">
      <div class="badge">
        <span class="dot" aria-hidden="true"></span>
        <span>开源作品集</span>
      </div>

      <div class="pill" title="Open Source">
        <Icon class="icon" icon="lucide:github" />
        <span>Open Source</span>
      </div>
    </div>

    <p class="desc">可复用组件、工具与实验性项目的精选集合。</p>

    <div class="stats" aria-label="Open source stats">
      <div class="stat">
        <div class="k">Projects</div>
        <div class="v">{{ ossData.projects }}</div>
      </div>
      <div class="stat">
        <div class="k">Stars</div>
        <div class="v">{{ formatCount(ossData.stars) }}</div>
      </div>
    </div>

    <div class="bottom">
      <div class="cta">
        查看开源作品
        <Icon class="arrow" icon="lucide:arrow-right" />
      </div>

      <div class="meta" aria-label="time meta">{{ metaText }}</div>
    </div>
  </a>
</template>

<style scoped lang="scss" src="./style.scss"></style>
