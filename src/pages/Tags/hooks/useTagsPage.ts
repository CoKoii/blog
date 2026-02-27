import { getTagMeta } from '@/config'
import { buildArticlePath } from '@/utils/paths'
import { findPostById, formatPostList, getAllPosts } from '@/utils/posts'
import { ALL_TAG_LABEL, ALL_TAG_SLUG, getTagTabs } from '@/utils/tags'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export const useTagsPage = () => {
  const route = useRoute()
  const router = useRouter()
  const allPosts = getAllPosts()
  const categories = getTagTabs()
  const activeTab = ref('')

  watch(
    () => route.params.category,
    (category) => (activeTab.value = String(category ?? '')),
    { immediate: true },
  )

  watch(activeTab, (value) => {
    if (value && value !== route.params.category) {
      router.push({ name: 'tags', params: { category: value } })
    }
  })

  const activeCategoryLabel = computed(
    () => categories.find((c) => c.value === activeTab.value)?.label ?? ALL_TAG_LABEL,
  )

  const filteredPosts = computed(() =>
    activeTab.value === ALL_TAG_SLUG
      ? allPosts
      : allPosts.filter((p) => p.categorySlug === activeTab.value),
  )

  const activeTagMeta = computed(() =>
    getTagMeta(activeTab.value === ALL_TAG_SLUG ? ALL_TAG_SLUG : activeCategoryLabel.value),
  )

  const goToArticle = (postId: string | number) => {
    const post = findPostById(postId, allPosts)
    if (post) router.push(buildArticlePath(post))
  }

  const cardPosts = computed(() => formatPostList(filteredPosts.value, 0))
  const activeTagColor = computed(() => activeTagMeta.value.color ?? '')
  const heroCover = computed(() => activeTagMeta.value.cover ?? '')
  const heroDescription = computed(() => activeTagMeta.value.description ?? '')

  return {
    categories,
    activeTab,
    activeCategoryLabel,
    cardPosts,
    activeTagColor,
    heroCover,
    heroDescription,
    goToArticle,
  }
}
