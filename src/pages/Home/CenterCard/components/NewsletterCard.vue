<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineOptions({
  name: 'CenterCardNewsletterCard',
})
</script>

<template>
  <div class="sidebar-block ad-block">
    <div class="ad-content">
      <Icon icon="lucide:mail" class="ad-icon" />
      <h4>Subscribe Newsletter</h4>
      <p>Get the latest trends weekly.</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sidebar-block {
  background: #fff;
  border-radius: var(--radius);
  padding: 20px;
  border: 1px solid #f0f0f0;
}

.ad-block {
  background: #111;
  color: #fff;
  text-align: center;
  padding: 30px 20px;

  .ad-icon {
    font-size: 2rem;
    margin-bottom: 12px;
    opacity: 0.8;
  }
  h4 {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }
  p {
    font-size: 0.85rem;
    opacity: 0.6;
  }
}
</style>
