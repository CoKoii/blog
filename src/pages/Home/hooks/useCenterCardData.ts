import { formatPostList, postsRef } from '@/utils/posts'
import { ALL_TAG_SLUG, tagTabsRef } from '@/utils/tags'
import { computed, ref } from 'vue'
import type { Project, Resource } from '../CenterCard/types'

const HOME_LATEST_POSTS_LIMIT = 5

export const useCenterCardData = () => {
  const tabs = tagTabsRef
  const projects: Project[] = [
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
  ]

  const groupedResources: Resource[] = [
    { title: 'Weekly Reads', count: 12, icon: 'lucide:book-open' },
    { title: 'Design Assets', count: 45, icon: 'lucide:palette' },
    { title: 'Code Snippets', count: 128, icon: 'lucide:scissors' },
  ]

  const activeTab = ref(ALL_TAG_SLUG)

  const visiblePosts = computed(() =>
    (
      activeTab.value === ALL_TAG_SLUG
        ? postsRef.value
        : postsRef.value.filter((post) => post.categorySlug === activeTab.value)
    ).slice(0, HOME_LATEST_POSTS_LIMIT),
  )

  const latestPosts = computed(() => formatPostList(visiblePosts.value, 2))

  return { projects, activeTab, tabs, latestPosts, groupedResources }
}
