<script setup lang="ts">
import { statsConfig } from '@/config'
import { getPostStats, postsRef } from '@/utils/posts'
import { Icon } from '@/components/Icon'
import { computed, onMounted, ref } from 'vue'

const days = ref('—')
const stats = computed(() => getPostStats(postsRef.value))
const DAY_MS = 864e5

const fmtWords = (v: number) => {
  if (!Number.isFinite(v)) return '—'
  const w = v / 10000
  return `${w.toFixed(w >= 10 ? 1 : 2)}w`
}

onMounted(() => {
  const start = new Date(`${statsConfig.startDate}T00:00:00`)
  const now = new Date()
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const n = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  days.value = String(Math.max(0, Math.round((n.getTime() - s.getTime()) / DAY_MS)))
})
</script>

<template>
  <div class="stats-box">
    <section class="stats-card" aria-label="网站统计">
      <div class="stats-metrics">
        <div class="stats-metric">
          <div class="stats-v">{{ days }}</div>
          <div class="stats-k">建站天数</div>
        </div>
        <div class="stats-metric">
          <div class="stats-v">{{ stats.totalPosts }}</div>
          <div class="stats-k">文章总数</div>
        </div>
        <div class="stats-metric">
          <div class="stats-v">{{ fmtWords(stats.totalWords) }}</div>
          <div class="stats-k">全站字数</div>
        </div>
      </div>

      <div class="stats-actions" aria-label="RSS 订阅">
        <a class="stats-action" href="/feed.xml" aria-label="RSS" title="RSS">
          <Icon class="stats-icon" icon="lucide:rss" />
        </a>
        <a class="stats-action" href="/atom.xml" aria-label="Atom" title="Atom">
          <Icon class="stats-icon" icon="lucide:atom" />
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
