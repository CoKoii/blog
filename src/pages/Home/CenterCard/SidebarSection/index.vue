<script setup lang="ts">
import CollectionsList from '../CollectionsList/index.vue'
import NewsletterCard from '../NewsletterCard/index.vue'
import PinnedProjects from '../PinnedProjects/index.vue'
import type { Project, Resource } from '../types'

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

<style scoped lang="scss" src="./style.scss"></style>
