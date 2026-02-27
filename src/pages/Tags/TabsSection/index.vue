<script setup lang="ts">
import SlidingTabs from '@/components/Tabs/SlidingTabs.vue'
import type { TagTab } from '@/types/tag'
import { computed } from 'vue'

const props = defineProps<{
  tabs: TagTab[]
  activeTab: string
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
}>()

const activeTabModel = computed({
  get: () => props.activeTab,
  set: (value: string) => emit('update:activeTab', value),
})
</script>

<template>
  <div class="tags-tabs">
    <SlidingTabs v-model:activeTab="activeTabModel" :tabs="tabs" />
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
