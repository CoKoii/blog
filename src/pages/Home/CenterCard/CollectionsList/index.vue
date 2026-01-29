<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Resource } from '../types'

defineProps<{
  groupedResources: Resource[]
}>()
</script>

<template>
  <div class="sidebar-block">
    <h3 class="side-title">Collections</h3>
    <ul class="resource-list">
      <li v-for="item in groupedResources" :key="item.title" class="res-item">
        <div class="res-left"><Icon :icon="item.icon" /> {{ item.title }}</div>
        <span class="res-count">{{ item.count }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
