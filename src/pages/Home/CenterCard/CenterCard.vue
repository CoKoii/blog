<script setup lang="ts">
import { ref } from 'vue'
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
const tabs = ['All', 'Dev', 'Life', 'Design']

const latestPosts = ref([
  {
    id: 1,
    title: '重构思维：如何写出像艺术品一样的代码',
    category: 'Architecture',
    time: '2 hrs ago',
    readTime: '5 min',
    hot: true,
    cover:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    title: 'CSS Grid 布局指南：打造 Bento 风格',
    category: 'Design',
    time: '1 day ago',
    readTime: '8 min',
    hot: true,
    cover:
      'https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Rust 初体验：与 TypeScript 的爱恨纠葛',
    category: 'Backend',
    time: '3 days ago',
    readTime: '12 min',
    hot: false,
    cover:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    title: '2025 年度总结：在不确定性中寻找支点',
    category: 'Life',
    time: '1 week ago',
    readTime: '10 min',
    hot: false,
    cover:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    title: 'Vite 5.0 迁移踩坑记录',
    category: 'DevOps',
    time: '2 weeks ago',
    readTime: '6 min',
    hot: false,
    cover:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
  },
])

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
