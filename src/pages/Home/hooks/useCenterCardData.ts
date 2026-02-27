import { formatPostList, getAllPosts } from '@/utils/posts'
import { ALL_TAG_SLUG, getTagTabs } from '@/utils/tags'
import { computed, ref } from 'vue'
import type { Project, Resource } from '../CenterCard/types'

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

  const groupedResources: Resource[] = [
    { title: 'Weekly Reads', count: 12, icon: 'lucide:book-open' },
    { title: 'Design Assets', count: 45, icon: 'lucide:palette' },
    { title: 'Code Snippets', count: 128, icon: 'lucide:scissors' },
  ]

  const activeTab = ref(ALL_TAG_SLUG)
  const allPosts = getAllPosts()

  const latestPosts = computed(() => {
    const posts =
      activeTab.value === ALL_TAG_SLUG
        ? allPosts
        : allPosts.filter((p) => p.categorySlug === activeTab.value)
    return formatPostList(posts, 2)
  })

  return {
    projects,
    activeTab,
    tabs: getTagTabs(),
    latestPosts,
    groupedResources,
  }
}
