<script setup lang="ts">
import ossData from '@/data/opensource.json'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const fmt = (n: number) =>
  n < 1000 ? `${n}` : `${n >= 10000 ? n / 1000 : Math.round((n / 1000) * 10) / 10}k`

const meta = computed(() => {
  if (!ossData.updatedAt) return '刚刚更新'
  const t = new Date(ossData.updatedAt)
  if (Number.isNaN(t.getTime())) return '刚刚更新'
  const days = Math.max(0, Math.floor((Date.now() - t.getTime()) / 864e5))
  return days === 0 ? '刚刚更新' : `${days}天前更新`
})
</script>

<template>
  <div class="os-card" aria-label="Open Source Projects">
    <div class="top">
      <div class="badge">
        <span class="dot" aria-hidden="true"></span>
        <span>开源作品集</span>
      </div>
      <a
        class="pill"
        title="Open Source"
        :href="`${ossData.profileUrl}/blog`"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon class="icon" icon="lucide:github" />
        <span>开源博客</span>
      </a>
    </div>

    <p class="desc">平时写的一些工具和小项目</p>

    <div class="stats" aria-label="Open source stats">
      <div class="stat">
        <div class="k">Projects</div>
        <div class="v">{{ ossData.projects }}</div>
      </div>
      <div class="stat">
        <div class="k">Stars</div>
        <div class="v">{{ fmt(ossData.stars) }}</div>
      </div>
    </div>

    <div class="bottom">
      <a class="cta" :href="ossData.profileUrl" target="_blank" rel="noopener noreferrer">
        查看我的作品
        <Icon class="arrow" icon="lucide:arrow-right" />
      </a>
      <div class="meta" aria-label="time meta">{{ meta }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
