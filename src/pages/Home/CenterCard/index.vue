<script setup lang="ts">
import FeedSection from './FeedSection/index.vue'
import SidebarSection from './SidebarSection/index.vue'
import { useCenterCardData } from './utils'


const { projects, activeTab, tabs, latestPosts, groupedResources } = useCenterCardData()
</script>

<template>
  <div class="CenterCard">
    <main class="main-content">
      <FeedSection v-model:active-tab="activeTab" :tabs="tabs" :latest-posts="latestPosts" />
      <SidebarSection class="center-sidebar" :projects="projects" :grouped-resources="groupedResources" />
    </main>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
