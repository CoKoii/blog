import { computed, ref } from 'vue'
import { usePostListFormat } from '@/composables/usePost'
import { getAllCategories, getAllPosts } from '@/utils/posts'
import type { Project, Resource } from './types'

export const useCenterCardData = () => {
  const projects = ref<Project[]>([
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

  const categories = getAllCategories()
  const tabs = computed(() => ['All', ...categories])

  const allPosts = getAllPosts()

  const filteredPosts = computed(() => {
    if (activeTab.value === 'All') {
      return allPosts
    }
    return allPosts.filter((post) => post.category === activeTab.value)
  })

  const latestPosts = computed(() => usePostListFormat(filteredPosts.value, 2))

  const groupedResources: Resource[] = [
    { title: 'Weekly Reads', count: 12, icon: 'lucide:book-open' },
    { title: 'Design Assets', count: 45, icon: 'lucide:palette' },
    { title: 'Code Snippets', count: 128, icon: 'lucide:scissors' },
  ]

  return {
    projects,
    activeTab,
    tabs,
    latestPosts,
    groupedResources,
  }
}
