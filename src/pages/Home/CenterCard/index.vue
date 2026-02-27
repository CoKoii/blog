<script setup lang="ts">
import StatsCard from '../TopCard/StatsCard/index.vue'
import { useCenterCardData } from '../hooks/useCenterCardData'
import FeedSection from './FeedSection/index.vue'
import SidebarSection from './SidebarSection/index.vue'

const { projects, activeTab, tabs, latestPosts, groupedResources } = useCenterCardData()
</script>

<template>
  <div class="CenterCard">
    <main class="main-content">
      <FeedSection v-model:active-tab="activeTab" :tabs="tabs" :latest-posts="latestPosts" />
      <StatsCard class="mobile-site-days" />
      <SidebarSection
        class="center-sidebar"
        :projects="projects"
        :grouped-resources="groupedResources"
      />
    </main>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
