<script setup lang="ts">
import ossData from '@/data/opensource.json'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const formatCount = (count: number) => {
  if (count < 1000) return `${count}`
  const value = count >= 10000 ? count / 1000 : Math.round((count / 1000) * 10) / 10
  return `${value}k`
}

const blogRepoUrl = 'https://github.com/CoKoii/blog'

const metaText = computed(() => {
  if (!ossData.updatedAt) return '刚刚更新'

  const updatedAt = new Date(ossData.updatedAt)
  if (Number.isNaN(updatedAt.getTime())) return '刚刚更新'

  const diff = Date.now() - updatedAt.getTime()
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))

  if (days === 0) return '刚刚更新'
  return `${days}天前更新`
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
        :href="blogRepoUrl"
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
        <div class="v">{{ formatCount(ossData.stars) }}</div>
      </div>
    </div>

    <div class="bottom">
      <a
        class="cta"
        :href="ossData.profileUrl || 'https://github.com/CoKoii'"
        target="_blank"
        rel="noopener noreferrer"
      >
        查看我的作品
        <Icon class="arrow" icon="lucide:arrow-right" />
      </a>

      <div class="meta" aria-label="time meta">{{ metaText }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
