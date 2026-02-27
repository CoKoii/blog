<script setup lang="ts">
import { githubConfig } from '@/config'
import { githubRepoStats } from '@/data/github'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const fmt = (n: number) =>
  n < 1000 ? `${n}` : `${n >= 10000 ? n / 1000 : Math.round((n / 1000) * 10) / 10}k`

const profileUrl = computed(() =>
  githubConfig.username ? `https://github.com/${githubConfig.username}` : 'https://github.com',
)
const repoUrl = computed(() =>
  githubConfig.repo ? `https://github.com/${githubConfig.repo}` : `${profileUrl.value}/blog`,
)
const projects = computed(() => Number(githubRepoStats.projects ?? 0))
const stars = computed(() => Number(githubRepoStats.stars ?? 0))
const updatedAt = computed(() => githubRepoStats.updatedAt ?? null)

const meta = computed(() => {
  if (!updatedAt.value) return '构建时更新'
  const t = new Date(updatedAt.value)
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
      <a class="pill" title="Open Source" :href="repoUrl" target="_blank" rel="noopener noreferrer">
        <Icon class="icon" icon="lucide:github" />
        <span>开源博客</span>
      </a>
    </div>

    <p class="desc">平时写的一些工具和小项目</p>

    <div class="stats" aria-label="Open source stats">
      <div class="stat">
        <div class="k">Projects</div>
        <div class="v">{{ projects }}</div>
      </div>
      <div class="stat">
        <div class="k">Stars</div>
        <div class="v">{{ fmt(stars) }}</div>
      </div>
    </div>

    <div class="bottom">
      <a class="cta" :href="profileUrl" target="_blank" rel="noopener noreferrer">
        查看我的作品
        <Icon class="arrow" icon="lucide:arrow-right" />
      </a>
      <div class="meta" aria-label="time meta">{{ meta }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
