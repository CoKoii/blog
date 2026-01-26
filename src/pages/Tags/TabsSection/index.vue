<script setup lang="ts">
import { computed } from 'vue'
import SlidingTabs from '@/components/Tabs/SlidingTabs.vue'


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

const activeTab = computed({
  get: () => props.activeTab,
  set: (value: string) => emit('update:activeTab', value),
})
</script>

<template>
  <div class="tags-tabs">
    <SlidingTabs v-model:activeTab="activeTab" :tabs="tabs" full-width />
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
