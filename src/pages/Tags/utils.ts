import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTagMeta } from '@/config'
import { usePostListFormat } from '@/composables/usePost'
import { buildArticlePath } from '@/utils/paths'
import { getAllPosts } from '@/utils/posts'
import { ALL_TAG_LABEL, ALL_TAG_SLUG, getTagTabs } from '@/utils/tags'

export const useTagsPage = () => {
  const route = useRoute()
  const router = useRouter()

  const allPosts = getAllPosts()
  const allTabValue = ALL_TAG_SLUG
  const categories = getTagTabs()
  const allTabLabel =
    categories.find((category) => category.value === allTabValue)?.label || ALL_TAG_LABEL

  const activeTab = ref('')

  watch(
    () => route.params.category,
    (category) => {
      activeTab.value = String(category || '')
    },
    { immediate: true },
  )

  watch(activeTab, (value) => {
    if (!value || value === route.params.category) return
    router.push({ name: 'tags', params: { category: value } })
  })

  const activeCategoryLabel = computed(() => {
    return categories.find((category) => category.value === activeTab.value)?.label || allTabLabel
  })

  const filteredPosts = computed(() =>
    activeTab.value === allTabValue
      ? allPosts
      : allPosts.filter((post) => post.categorySlug === activeTab.value),
  )

  const cardPosts = computed(() => usePostListFormat(filteredPosts.value, 0))

  const activeTagMeta = computed(() => {
    if (activeTab.value === allTabValue) return getTagMeta(allTabValue)
    return getTagMeta(activeCategoryLabel.value)
  })

  const activeTagColor = computed(() => activeTagMeta.value.color || getTagMeta(allTabValue).color)

  const heroCover = computed(() => activeTagMeta.value.cover || '')

  const heroDescription = computed(() => {
    if (!activeCategoryLabel.value) return ''
    return activeTagMeta.value.description || ''
  })

  const goToArticle = (postId: string | number) => {
    const post = allPosts.find((p) => p.id === String(postId))
    if (!post) return
    router.push(buildArticlePath(post))
  }

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
