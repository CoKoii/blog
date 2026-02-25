<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { computed, nextTick, onBeforeUnmount, onBeforeUpdate, onMounted, ref, watch } from 'vue'

type TabItem = string | { label: string; value: string }

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
  return i === -1 ? 0 : i
})

const tabsRef = ref<HTMLDivElement>()
const btns = ref<HTMLButtonElement[]>([])
const observer = ref<ResizeObserver | null>(null)

const setBtnRef = (el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLButtonElement) btns.value.push(el)
}

const center = async () => {
  await nextTick()
  const cont = tabsRef.value
  const btn = btns.value[activeIdx.value]
  if (!cont || !btn) return

  const cRect = cont.getBoundingClientRect()
  const bRect = btn.getBoundingClientRect()
  const pad = Number.parseFloat(getComputedStyle(cont).paddingLeft) || 0
  const x = bRect.left - cRect.left - pad
  const w = bRect.width

  cont.style.setProperty('--indicator-x', `${Math.max(0, x)}px`)
  cont.style.setProperty('--indicator-width', `${w}px`)

  const offset = bRect.left + bRect.width / 2 - cRect.left - cRect.width / 2
  cont.scrollTo({ left: cont.scrollLeft + offset, behavior: 'smooth' })
}

const setTab = (tab: TabItem) => emit('update:activeTab', getVal(tab))

onBeforeUpdate(() => {
  btns.value = []
})

onMounted(() => {
  center()
  if (tabsRef.value) {
    observer.value = new ResizeObserver(center)
    observer.value.observe(tabsRef.value)
  }
})

onBeforeUnmount(() => {
  observer.value?.disconnect()
  observer.value = null
})

watch(() => props.activeTab, center)
watch(() => props.tabs, center, { deep: true })
</script>

<template>
  <div
    ref="tabsRef"
    class="tabs"
    :class="{ 'tabs--full': fullWidth }"
    :style="{ '--active-index': activeIdx }"
  >
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
    font-weight: 900;
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
