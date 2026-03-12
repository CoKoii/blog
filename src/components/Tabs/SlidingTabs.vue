<script setup lang="ts">
import type { TabItem } from '@/types/tab'
import type { ComponentPublicInstance } from 'vue'
import { computed, nextTick, onBeforeUnmount, onBeforeUpdate, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  tabs: TabItem[]
  activeTab: string
  fullWidth?: boolean
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
}>()

const getVal = (tab: TabItem) => (typeof tab === 'string' ? tab : tab.value)
const getLbl = (tab: TabItem) => (typeof tab === 'string' ? tab : tab.label)

const activeIdx = computed(() => {
  const i = props.tabs.findIndex((t) => getVal(t) === props.activeTab)
  return i < 0 ? 0 : i
})

const tabsRef = ref<HTMLDivElement | null>(null)
let btns: HTMLButtonElement[] = []
let observer: ResizeObserver | null = null

const setBtnRef = (el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLButtonElement) btns.push(el)
}

const getTabMetrics = (container: HTMLDivElement, button: HTMLButtonElement) => {
  const paddingInlineStart = Number.parseFloat(getComputedStyle(container).paddingInlineStart) || 0

  return {
    indicatorWidth: button.offsetWidth,
    indicatorX: Math.max(0, button.offsetLeft - paddingInlineStart),
    scrollLeftTarget: button.offsetLeft + button.offsetWidth / 2 - container.clientWidth / 2,
  }
}

const center = async () => {
  await nextTick()
  const container = tabsRef.value
  const button = btns[activeIdx.value]
  if (!container || !button) return

  const { indicatorWidth, indicatorX, scrollLeftTarget } = getTabMetrics(container, button)
  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  container.style.setProperty('--indicator-x', `${indicatorX}px`)
  container.style.setProperty('--indicator-width', `${indicatorWidth}px`)
  container.scrollTo({ left: Math.min(Math.max(0, scrollLeftTarget), maxScrollLeft), behavior })
}

const setTab = (tab: TabItem) => emit('update:activeTab', getVal(tab))

onBeforeUpdate(() => {
  btns = []
})

onMounted(() => {
  center()
  if (tabsRef.value) {
    observer = new ResizeObserver(center)
    observer.observe(tabsRef.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

watch(() => props.activeTab, center)
watch(() => props.tabs, center, { deep: true })
</script>

<template>
  <div ref="tabsRef" class="tabs" :class="{ 'tabs--full': fullWidth }">
    <span class="tab-indicator" aria-hidden="true">
      <span :key="activeTab" class="tab-indicator-inner" />
    </span>
    <button
      v-for="tab in tabs"
      :key="getVal(tab)"
      :ref="setBtnRef"
      class="tab-btn"
      :class="{ active: activeTab === getVal(tab) }"
      @click="setTab(tab)"
    >
      {{ getLbl(tab) }}
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
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;

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
    transition:
      transform 0.55s cubic-bezier(0.16, 1.35, 0.3, 1),
      width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
    pointer-events: none;
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
    appearance: none;
    background: transparent;
    border: none;
    padding: var(--space-6px) var(--space-14px);
    font-size: 0.85rem;
    font-weight: 900;
    color: var(--color-gray-550);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: color 0.2s ease;
    position: relative;
    z-index: 1;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;

    &.active {
      color: var(--color-black);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px var(--color-accent-blue);
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

    .tab-btn {
      flex: 0 0 auto;
      scroll-snap-align: center;
    }
  }
}
</style>
