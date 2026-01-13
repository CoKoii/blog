<script setup lang="ts">
import CollectionsList from './CollectionsList.vue'
import NewsletterCard from './NewsletterCard.vue'
import PinnedProjects from './PinnedProjects.vue'

defineOptions({
  name: 'CenterCardSidebarSection',
})

type Project = {
  name: string
  desc: string
  icon: string
  color: string
  stars: string
}

type Resource = {
  title: string
  count: number
  icon: string
}

defineProps<{
  projects: Project[]
  groupedResources: Resource[]
}>()
</script>

<template>
  <aside class="sidebar-section">
    <PinnedProjects :projects="projects" />
    <CollectionsList :grouped-resources="groupedResources" />
    <NewsletterCard />
  </aside>
</template>

<style scoped lang="scss">
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
