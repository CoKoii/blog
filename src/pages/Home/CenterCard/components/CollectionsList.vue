<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineOptions({
  name: 'CenterCardCollectionsList',
})

type Resource = {
  title: string
  count: number
  icon: string
}

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

<style scoped lang="scss">
.sidebar-block {
  background: #fff;
  border-radius: var(--radius);
  padding: 20px;
  border: 1px solid #f0f0f0;

  .side-title {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: #111;
  }
}

.resource-list {
  padding: 0;
  margin: 0;
  list-style: none;
  .res-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px dashed #eee;
    font-size: 0.9rem;
    color: #555;
    cursor: pointer;
    &:last-child {
      border-bottom: none;
    }
    &:hover {
      color: #000;
    }
    .res-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .res-count {
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      color: #888;
    }
  }
}
</style>
