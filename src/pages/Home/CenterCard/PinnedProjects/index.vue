<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Project } from '../types'

defineProps<{
  projects: Project[]
}>()
</script>

<template>
  <div class="sidebar-block">
    <h3 class="side-title">
      <Icon icon="lucide:pin" />
      置顶项目
    </h3>
    <div class="mini-grid">
      <div v-for="p in projects" :key="p.name" class="mini-card">
        <div class="card-icon" :class="p.color">
          <Icon :icon="p.icon" />
        </div>
        <div class="card-text">
          <div class="card-name">{{ p.name }}</div>
          <div class="card-desc">{{ p.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
