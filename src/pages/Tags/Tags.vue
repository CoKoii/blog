<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buildArticlePath } from '@/utils/paths'
import { getAllPosts } from '@/utils/posts'
import { usePostListFormat } from '@/composables/usePost'
import { getTagMeta } from '@/config'
import { ALL_TAG_SLUG, getTagEntries } from '@/utils/tags'
import SlidingTabs from '@/components/Tabs/SlidingTabs.vue'

defineOptions({
  name: 'Tags',
})

const route = useRoute()
const router = useRouter()

const allPosts = getAllPosts()
const allTabValue = ALL_TAG_SLUG
const categories = [
  { value: allTabValue, label: 'All' },
  ...getTagEntries().map((tag) => ({ value: tag.slug, label: tag.label })),
]

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
  return categories.find((category) => category.value === activeTab.value)?.label || ''
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
</script>

<template>
  <div class="Tags">
    <div class="tags-tabs">
      <SlidingTabs v-model:activeTab="activeTab" :tabs="categories" full-width />
    </div>

    <section class="tags-hero">
      <div class="hero-text">
        <div class="hero-meta">
          <span class="count">{{ cardPosts.length }} posts</span>
          <span class="dot">·</span>
          <span class="label">分类</span>
        </div>
        <h1 class="hero-title">{{ activeCategoryLabel || 'Tags' }}</h1>
        <p class="hero-desc">{{ heroDescription }}</p>
      </div>
      <div v-if="heroCover" class="hero-media">
        <img v-lazy="heroCover" :alt="activeCategoryLabel" />
      </div>
      <div v-else class="hero-media hero-media--empty" aria-hidden="true"></div>
    </section>

    <section class="tags-grid">
      <article
        v-for="post in cardPosts"
        :key="post.id"
        class="post-card"
        @click="goToArticle(post.id)"
      >
        <div class="card-cover">
          <img v-lazy="post.cover" :alt="post.title" />
          <span class="read-badge">{{ post.readTime }} read</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ post.title }}</h3>
          <div class="card-meta">
            <span class="tag-pill">{{ post.category }}</span>
            <span class="dot">·</span>
            <span class="time">{{ post.time }}</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped lang="scss">
.Tags {
  display: flex;
  flex-direction: column;
  gap: 24px;
  --primary-hover-color: #7d2ae8;
  --tags-color-text-primary: #111827;
  --tags-color-text-secondary: #6b7280;
  --tags-color-text-muted: #4b5563;
  --tags-color-text-title: #1f2937;
  --tags-color-accent: #3b82f6;
  --tags-color-divider: #d1d5db;
  --tags-color-pill-bg: #f3f4f6;
  --tags-color-pill-text: #555;
  --tags-color-badge-bg: rgba(17, 24, 39, 0.82);
  --tags-color-badge-text: #fff;
  --tags-color-hover-outline: rgba(59, 130, 246, 1);
}

.tags-tabs {
  width: fit-content;
  max-width: 100%;
  display: flex;
  justify-content: flex-start;
}

.tags-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-meta {
  font-size: 0.85rem;
  color: var(--tags-color-text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;

  .count {
    font-weight: 600;
    color: var(--tags-color-text-primary);
  }

  .dot {
    color: var(--tags-color-divider);
  }
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--tags-color-text-primary);
}

.hero-desc {
  font-size: 1.05rem;
  color: var(--tags-color-text-muted);
  line-height: 1.8;
}

.hero-media {
  width: 100%;
  height: 450px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.hero-media--empty {
  background: transparent;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 48px;
}

.post-card {
  width: 100%;
  min-height: 0;
  border-radius: 18px;
  border: 1px solid transparent;
  background: transparent;
  overflow: visible;
  cursor: pointer;
  transition:
    transform 0.5s ease,
    box-shadow 0.5s ease;
  display: flex;
  flex-direction: column;

  &:hover,
  &:focus-within {
    transform: none;
    box-shadow: none;
  }
}

.card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 18px;
  transition:
    transform 0.5s ease,
    box-shadow 0.5s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 18px;
  }

  .read-badge {
    position: absolute;
    right: 12px;
    bottom: 12px;
    background: var(--tags-color-badge-bg);
    color: var(--tags-color-badge-text);
    padding: 4px 10px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
  }
}

.post-card:hover .card-cover,
.post-card:focus-within .card-cover {
  transform: scale(1.03);
  box-shadow: none;
  outline: 3px solid var(--tags-color-hover-outline);
  outline-offset: 2px;
}

.card-body {
  padding: 12px 4px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  justify-content: flex-start;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--tags-color-text-title);
  line-height: 1.5;
  transition: color 0.2s ease;
  cursor: pointer;

  &:hover {
    color: var(--tags-color-accent);
  }
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  color: var(--tags-color-text-secondary);

  .tag-pill {
    background: var(--tags-color-pill-bg);
    padding: 2px 8px;
    border-radius: 4px;
    color: var(--tags-color-pill-text);
    font-weight: 500;
    font-size: 0.72rem;
  }

  .dot {
    color: var(--tags-color-divider);
  }
}

@media (max-width: 1024px) {
  .tags-hero {
    grid-template-columns: 1fr;
  }

  .tags-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .tags-hero {
    padding: 20px;
  }

  .hero-title {
    font-size: 1.6rem;
  }

  .tags-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .tags-grid {
    grid-template-columns: 1fr;
  }
}
</style>
