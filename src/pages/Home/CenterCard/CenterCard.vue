<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAllPosts, getAllCategories } from '@/utils/posts'
import { usePostListFormat } from '@/composables/usePost'
import FeedSection from './components/FeedSection.vue'
import SidebarSection from './components/SidebarSection.vue'

defineOptions({
  name: 'CenterCard',
})

const projects = ref([
  {
    name: 'Hero-Admin',
    desc: 'Vue3 Enterprise Template',
    icon: 'lucide:layout-dashboard',
    color: 'from-purple-500 to-indigo-500',
    stars: '2.4k',
  },
  {
    name: 'Dev-Kit',
    desc: 'Rust based dev tools',
    icon: 'lucide:wrench',
    color: 'from-orange-400 to-red-500',
    stars: '856',
  },
])

const activeTab = ref('All')

// 从 posts 目录动态获取分类
const categories = getAllCategories()
const tabs = computed(() => ['All', ...categories])

// 从 Markdown 文件读取文章数据并格式化
const allPosts = getAllPosts()

// 根据 activeTab 过滤文章
const filteredPosts = computed(() => {
  if (activeTab.value === 'All') {
    return allPosts
  }
  return allPosts.filter((post) => post.category === activeTab.value)
})

const latestPosts = computed(() => usePostListFormat(filteredPosts.value, 2))

const groupedResources = [
  { title: 'Weekly Reads', count: 12, icon: 'lucide:book-open' },
  { title: 'Design Assets', count: 45, icon: 'lucide:palette' },
  { title: 'Code Snippets', count: 128, icon: 'lucide:scissors' },
]
</script>

<template>
  <div class="CenterCard">
    <main class="main-content">
      <FeedSection v-model:active-tab="activeTab" :tabs="tabs" :latest-posts="latestPosts" />
      <SidebarSection :projects="projects" :grouped-resources="groupedResources" />
    </main>
  </div>
</template>

<style scoped lang="scss">
.CenterCard {
  --bg-page: #f8f9fa;
  --bg-card: #ffffff;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-light: #e5e7eb;
  --accent-color: #000000;
  --primary-hover-color: #7d2ae8;
  --radius-xl: 24px;
  --radius: 16px;
  color: var(--text-primary);
}

.main-content {
  display: grid;
  grid-template-columns: 1fr calc(25% - 32px);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
</style>
