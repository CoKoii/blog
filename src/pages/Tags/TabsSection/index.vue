<script setup lang="ts">
import SlidingTabs from '@/components/Tabs/SlidingTabs.vue'
import { computed } from 'vue'

type TabItem = {
  value: string
  label: string
}

const props = defineProps<{
  tabs: TabItem[]
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
    <SlidingTabs v-model:activeTab="activeTabModel" :tabs="tabs" full-width />
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
