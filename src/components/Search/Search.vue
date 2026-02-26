<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  createEmptyPreparedSearchIndex,
  prepareSearchIndex,
  searchDocuments,
  splitHighlightSegments,
  type PreparedSearchIndex,
  type SearchResult,
} from './search'

const router = useRouter()
const RESULT_LIMIT = 12
const GAP = 8

let locked = false
let originalHtmlOverflow = ''
let originalHtmlPadding = ''
let originalBodyOverflow = ''

const isOpen = ref(false)
const isLoading = ref(false)
const isIndexReady = ref(false)
const keyword = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const listBodyRef = ref<HTMLElement | null>(null)
const preparedSearchIndex = shallowRef<PreparedSearchIndex>(createEmptyPreparedSearchIndex())

const keywordValue = computed(() => keyword.value.trim())
const results = computed<SearchResult[]>(() =>
  keywordValue.value && preparedSearchIndex.value.docs.length
    ? searchDocuments(keywordValue.value, preparedSearchIndex.value, RESULT_LIMIT)
    : [],
)
const shouldShowEmptyState = computed(
  () => Boolean(keywordValue.value) && !isLoading.value && !results.value.length,
)

const helperText = computed(() => {
  if (isLoading.value) return '正在构建搜索索引...'
  if (!keywordValue.value)
    return isIndexReady.value
      ? `已收录 ${preparedSearchIndex.value.docs.length} 篇文章`
      : '按 / 快速打开搜索，支持标题和正文内容检索'
  return `找到 ${results.value.length} 条结果`
})

const lockScroll = (lock: boolean) => {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  const body = document.body

  if (lock) {
    if (!locked) {
      originalHtmlOverflow = html.style.overflow
      originalHtmlPadding = html.style.paddingRight
      originalBodyOverflow = body.style.overflow
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
      locked = true
    }

    const scrollbarWidth = Math.max(window.innerWidth - html.clientWidth, 0)
    html.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : originalHtmlPadding
  } else {
    if (!locked) return
    html.style.overflow = originalHtmlOverflow
    html.style.paddingRight = originalHtmlPadding
    body.style.overflow = originalBodyOverflow
    locked = false
  }
}

const handleResize = () => {
  if (isOpen.value) lockScroll(true)
}

const ensureIndex = async () => {
  if (isIndexReady.value || isLoading.value) return
  isLoading.value = true
  try {
    const { searchIndex } = await import('virtual:search-index')
    preparedSearchIndex.value = prepareSearchIndex(searchIndex)
    isIndexReady.value = true
  } catch (error) {
    console.error('[Search] Failed to load search index', error)
  } finally {
    isLoading.value = false
  }
}

const openSearch = async () => {
  isOpen.value = true
  activeIndex.value = 0
  await ensureIndex()
  nextTick(() => inputRef.value?.focus())
}

const closeSearch = (clear = false) => {
  isOpen.value = false
  if (clear) keyword.value = ''
}

const goToResult = async (item: SearchResult) => {
  closeSearch(true)
  await router.push(item.url)
}

const scrollIntoView = (behavior: ScrollBehavior = 'smooth') => {
  nextTick(() => {
    const container = listBodyRef.value
    if (!container) return
    const node = container.querySelector<HTMLElement>(`[data-result-index="${activeIndex.value}"]`)
    if (!node) return

    const total = results.value.length
    const maxScroll = container.scrollHeight - container.clientHeight

    if (activeIndex.value <= 0) {
      container.scrollTo({ top: 0, behavior })
    } else if (activeIndex.value >= total - 1) {
      container.scrollTo({ top: maxScroll, behavior })
    } else {
      const itemTop = node.offsetTop - GAP
      const itemBottom = itemTop + node.offsetHeight + GAP * 2
      const visibleTop = container.scrollTop
      const visibleBottom = visibleTop + container.clientHeight

      if (itemTop < visibleTop) {
        container.scrollTo({ top: Math.max(itemTop, 0), behavior })
      } else if (itemBottom > visibleBottom) {
        container.scrollTo({
          top: Math.min(itemBottom - container.clientHeight, maxScroll),
          behavior,
        })
      }
    }
  })
}

const moveActive = (offset: 1 | -1) => {
  const total = results.value.length
  if (!total) return
  activeIndex.value = (activeIndex.value + offset + total) % total
  scrollIntoView('smooth')
}

const goToActive = () => {
  const item = results.value[activeIndex.value]
  if (item) void goToResult(item)
}

const isInput = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.matches('input, textarea, select') || target.isContentEditable)

const handleKeydown = (e: KeyboardEvent) => {
  if (e.defaultPrevented || e.isComposing) return

  if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isInput(e.target)) {
    e.preventDefault()
    void openSearch()
    return
  }

  if (!isOpen.value) return

  const actions: Record<string, () => void> = {
    Escape: () => closeSearch(),
    ArrowDown: () => moveActive(1),
    ArrowUp: () => moveActive(-1),
    Enter: () => results.value.length && goToActive(),
  }

  const action = actions[e.key]
  if (action) {
    e.preventDefault()
    action()
  }
}

watch(results, (list) => {
  activeIndex.value = list.length ? Math.min(activeIndex.value, list.length - 1) : 0
})

watch(keywordValue, () => (activeIndex.value = 0))
watch(isOpen, (open) => lockScroll(open))

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  lockScroll(false)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <button class="Search" type="button" aria-label="打开搜索" @click="openSearch">
    <div class="text">
      <Icon icon="lucide:search" />
      <p>Search</p>
    </div>
    <div class="icon">
      <Icon icon="gg:format-slash" />
    </div>
  </button>

  <Teleport to="body">
    <Transition name="search-panel">
      <div v-if="isOpen" class="SearchOverlay" @click.self="closeSearch()">
        <section class="SearchDialog" role="dialog" aria-modal="true" aria-label="站内搜索">
          <div class="SearchDialogInput">
            <Icon class="searchIcon" icon="lucide:search" />
            <input
              ref="inputRef"
              v-model="keyword"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="搜索文章标题或内容..."
            />
            <button type="button" class="esc" @click="closeSearch(true)">Esc</button>
          </div>

          <div class="SearchDialogMeta">
            <p>{{ helperText }}</p>
            <p class="hint">
              <span><kbd>/</kbd> 打开</span>
              <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
              <span><kbd>Enter</kbd> 跳转</span>
            </p>
          </div>

          <div ref="listBodyRef" class="SearchDialogBody">
            <div v-if="isLoading" class="SearchState">正在准备索引...</div>
            <div v-else-if="shouldShowEmptyState" class="SearchState">
              没有找到匹配文章，换个关键词试试
            </div>
            <div v-else-if="!keywordValue" class="SearchState">
              输入关键词后开始搜索，支持标题与正文。
            </div>
            <ul v-else class="SearchList" role="listbox" aria-label="搜索结果">
              <li
                v-for="(item, index) in results"
                :key="item.id"
                :data-result-index="index"
                class="SearchItem"
                :class="{ active: index === activeIndex }"
                role="option"
                :aria-selected="index === activeIndex"
                @mouseenter="activeIndex = index"
                @click="goToResult(item)"
              >
                <p class="title">
                  <template
                    v-for="(segment, si) in splitHighlightSegments(item.title, keywordValue)"
                    :key="`${item.id}-t-${si}`"
                  >
                    <mark v-if="segment.match">{{ segment.text }}</mark>
                    <span v-else>{{ segment.text }}</span>
                  </template>
                </p>

                <p class="snippet">
                  <template
                    v-for="(segment, si) in splitHighlightSegments(item.snippet, keywordValue)"
                    :key="`${item.id}-s-${si}`"
                  >
                    <mark v-if="segment.match">{{ segment.text }}</mark>
                    <span v-else>{{ segment.text }}</span>
                  </template>
                </p>

                <div class="meta">
                  <span>{{ item.category }}</span>
                  <span class="dot">·</span>
                  <span>{{ item.date || '未标注日期' }}</span>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use './style.scss';
</style>
