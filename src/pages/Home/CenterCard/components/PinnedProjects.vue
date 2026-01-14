<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineOptions({
  name: 'CenterCardPinnedProjects',
})

type Project = {
  name: string
  desc: string
  icon: string
  color: string
  stars: string
}

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
    display: flex;
    align-items: center;
    gap: 6px;

    .iconify {
      transform: rotate(45deg);
    }
  }
}

.mini-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.mini-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1px solid transparent;
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.35s ease,
    background 0.2s ease;
  cursor: pointer;

  &:hover,
  &:focus-within {
    transform: translateY(-2px);
    background: #fff;
    border-color: rgba(59, 130, 246, 0.22);
    box-shadow:
      0 8px 20px rgba(15, 23, 42, 0.08),
      0 0 0 2px rgba(59, 130, 246, 1);

    .card-name {
      color: var(--primary-hover-color, #3b82f6);
    }
  }

  .card-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 1.1rem;
    &.from-purple-500 {
      background: linear-gradient(135deg, #a855f7, #6366f1);
    }
    &.from-orange-400 {
      background: linear-gradient(135deg, #fb923c, #ef4444);
    }
  }

  .card-text {
    .card-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #333;
      transition: color 0.2s;
    }
    .card-desc {
      font-size: 0.75rem;
      color: #5e5e5e;
    }
  }
}
</style>
