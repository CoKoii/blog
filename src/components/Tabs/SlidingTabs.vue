<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onBeforeUpdate, onMounted, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'

type TabItem = string | { label: string; value: string }

const props = defineProps<{
  tabs: TabItem[]
  activeTab: string
  fullWidth?: boolean
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
}>()

const getTabValue = (tab: TabItem) => (typeof tab === 'string' ? tab : tab.value)
const getTabLabel = (tab: TabItem) => (typeof tab === 'string' ? tab : tab.label)

const activeIndex = computed(() => {
  const index = props.tabs.findIndex((tab) => getTabValue(tab) === props.activeTab)
  return index === -1 ? 0 : index
})

const tabsStyle = computed(() => ({
  '--active-index': activeIndex.value,
}))

const tabsRef = ref<HTMLDivElement>()
const tabButtons = ref<HTMLButtonElement[]>([])
const tabsResizeObserver = ref<ResizeObserver | null>(null)

const setTabButtonRef = (el: Element | ComponentPublicInstance | null) => {
  if (el && el instanceof HTMLButtonElement) {
    tabButtons.value.push(el)
  }
}

const centerActiveTab = async () => {
  await nextTick()
  const container = tabsRef.value
  const button = tabButtons.value[activeIndex.value]

  if (!container || !button) return

  const containerRect = container.getBoundingClientRect()
  const buttonRect = button.getBoundingClientRect()
  const containerStyles = getComputedStyle(container)
  const paddingLeft = Number.parseFloat(containerStyles.paddingLeft) || 0
  const indicatorX = buttonRect.left - containerRect.left - paddingLeft
  const indicatorWidth = buttonRect.width

  container.style.setProperty('--indicator-x', `${Math.max(0, indicatorX)}px`)
  container.style.setProperty('--indicator-width', `${indicatorWidth}px`)
  const offset =
    buttonRect.left + buttonRect.width / 2 - containerRect.left - containerRect.width / 2

  container.scrollTo({
    left: container.scrollLeft + offset,
    behavior: 'smooth',
  })
}

const setTab = (tab: TabItem) => {
  emit('update:activeTab', getTabValue(tab))
}

onBeforeUpdate(() => {
  tabButtons.value = []
})

onMounted(() => {
  centerActiveTab()
  if (!tabsRef.value) return
  tabsResizeObserver.value = new ResizeObserver(() => {
    centerActiveTab()
  })
  tabsResizeObserver.value.observe(tabsRef.value)
})

onBeforeUnmount(() => {
  tabsResizeObserver.value?.disconnect()
  tabsResizeObserver.value = null
})

watch(() => props.activeTab, centerActiveTab)
watch(
  () => props.tabs,
  () => centerActiveTab(),
  { deep: true },
)
</script>

<template>
  <div ref="tabsRef" class="tabs" :class="{ 'tabs--full': fullWidth }" :style="tabsStyle">
    <span class="tab-indicator" aria-hidden="true">
      <span :key="activeTab" class="tab-indicator-inner" />
    </span>
    <button
      v-for="tab in tabs"
      :key="getTabValue(tab)"
      :ref="setTabButtonRef"
      class="tab-btn"
      :class="{ active: activeTab === getTabValue(tab) }"
      @click="setTab(tab)"
    >
      {{ getTabLabel(tab) }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  display: inline-flex;
  align-items: center;
  gap: var(--space-6px);
  background: var(--color-gray-140);
  padding: var(--space-3px);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  isolation: isolate;

  &.tabs--full {
    width: 100%;
  }

  .tab-indicator {
    position: absolute;
    top: var(--space-3px);
    bottom: var(--space-3px);
    left: var(--space-3px);
    width: var(--indicator-width, 0px);
    transform: translateX(var(--indicator-x, 0px));
    transition: transform 0.55s cubic-bezier(0.16, 1.35, 0.3, 1);
    will-change: transform;
    z-index: 0;
  }

  .tab-indicator-inner {
    position: absolute;
    inset: 0;
    background: var(--color-white);
    border-radius: var(--radius-sm);
    box-shadow: 0 6px 14px rgba(17, 24, 39, 0.12);
    animation: jelly 0.55s ease-out;
  }

  .tab-btn {
    background: transparent;
    border: none;
    padding: var(--space-6px) var(--space-14px);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-gray-550);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: color 0.2s ease;
    position: relative;
    z-index: 1;
    white-space: nowrap;

    &.active {
      color: var(--color-black);
    }
  }
}

@keyframes jelly {
  0% {
    transform: scale(0.9);
  }
  45% {
    transform: scaleX(1.08) scaleY(0.92);
  }
  70% {
    transform: scaleX(0.98) scaleY(1.04);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 720px) {
  .tabs {
    width: 100%;
    display: flex;
    align-items: center;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .tab-indicator {
      display: none;
    }

    .tab-btn {
      flex: 0 0 auto;
      padding: var(--space-6px) var(--space-14px);
      scroll-snap-align: center;

      &.active {
        background: var(--color-white);
        color: var(--color-black);
        box-shadow: 0 6px 14px rgba(17, 24, 39, 0.12);
        animation: jelly 0.55s ease-out;
      }
    }
  }
}
</style>
