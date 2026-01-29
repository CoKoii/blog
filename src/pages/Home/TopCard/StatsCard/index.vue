<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onMounted, ref, computed } from 'vue'
import { getAllPosts } from '@/utils/posts'
import { usePostStats } from '@/composables/usePost'
import { statsConfig } from '@/config'

const statsDays = ref('—')

// 获取文章统计数据
const allPosts = getAllPosts()
const stats = usePostStats(allPosts)

const totalArticles = computed(() => stats.totalPosts)
const totalWords = computed(() => stats.totalWords)

const formatWords = (value: number) => {
  if (!Number.isFinite(value)) return '—'
  const wanValue = value / 10000
  const decimals = wanValue >= 10 ? 1 : 2
  return `${wanValue.toFixed(decimals)}w`
}

onMounted(() => {
  const start = new Date(`${statsConfig.startDate}T00:00:00`)
  const now = new Date()
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.max(0, Math.round((nowDay.getTime() - startDay.getTime()) / 86400000))
  statsDays.value = String(diff)
})
</script>

<template>
  <div class="stats-box">
    <section class="stats-card" aria-label="网站统计">
      <div class="stats-metrics">
        <div class="stats-metric">
          <div class="stats-v">{{ statsDays }}</div>
          <div class="stats-k">建站天数</div>
        </div>
        <div class="stats-metric">
          <div class="stats-v">{{ totalArticles }}</div>
          <div class="stats-k">文章总数</div>
        </div>
        <div class="stats-metric">
          <div class="stats-v">{{ formatWords(totalWords) }}</div>
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
