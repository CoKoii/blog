<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onMounted, ref, computed } from 'vue'
import { getAllPosts } from '@/utils/posts'
import { usePostStats } from '@/composables/usePost'
import { statsConfig } from '@/config/profile'

defineOptions({
  name: 'StatsCard',
})

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

<style scoped lang="scss">
.stats-box {
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  position: relative;
  display: block;
  height: 100%;
  width: 100%;
}

.stats-card {
  --text: #ffffff;
  --muted: rgba(255, 255, 255, 0.78);
  --muted2: rgba(255, 255, 255, 0.7);
  --radius: 18px;
  --shadow: 0 18px 50px rgba(17, 24, 39, 0.12);

  width: 100%;
  height: 100%;
  min-height: 180px;
  border-radius: var(--radius);
  background: linear-gradient(135deg, #2b4df0 0%, #3a6bf3 55%, #4e8cff 100%);
  position: relative;
  overflow: hidden;
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text);
  text-align: center;
}

.stats-metrics {
  position: relative;
  z-index: 1;
  margin-top: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 0;
}

.stats-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  padding: 4px 10px;
}

.stats-k {
  font-size: 16px;
  color: var(--muted2);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.stats-v {
  font-size: 40px;
  font-weight: 920;
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.stats-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: absolute;
  top: 12px;
  right: 12px;
}

.stats-action {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.12);
  display: grid;
  place-items: center;
  color: #ffffff;
  text-decoration: none;
  transition:
    transform 0.14s ease,
    background 0.14s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
}

.stats-icon {
  width: 12px;
  height: 12px;
}
</style>
