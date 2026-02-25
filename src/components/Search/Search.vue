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

const isOpen = ref(false)
const isLoading = ref(false)
const isIndexReady = ref(false)
const keyword = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const preparedSearchIndex = shallowRef<PreparedSearchIndex>(createEmptyPreparedSearchIndex())

const keywordValue = computed(() => keyword.value.trim())

const results = computed<SearchResult[]>(() => {
  if (!keywordValue.value || !preparedSearchIndex.value.documents.length) return []
  return searchDocuments(keywordValue.value, preparedSearchIndex.value, 12)
})

const shouldShowEmptyState = computed(
  () => Boolean(keywordValue.value) && !isLoading.value && results.value.length === 0,
)

const helperText = computed(() => {
  if (isLoading.value) return '正在构建搜索索引...'
  if (!keywordValue.value) {
    if (!isIndexReady.value) return '按 / 快速打开搜索，支持标题和正文内容检索'
    return `已收录 ${preparedSearchIndex.value.documents.length} 篇文章`
  }
  return `找到 ${results.value.length} 条结果`
})

const lockBodyScroll = (locked: boolean) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = locked ? 'hidden' : ''
}

const focusInput = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const ensureSearchIndex = async () => {
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
  if (!isOpen.value) {
    isOpen.value = true
  }
  await ensureSearchIndex()
  focusInput()
}

const closeSearch = (clearKeyword = false) => {
  isOpen.value = false
  if (clearKeyword) {
    keyword.value = ''
  }
}

const goToResult = async (item: SearchResult) => {
  closeSearch(true)
  await router.push(item.url)
}

const activateResultByOffset = (offset: 1 | -1) => {
  const total = results.value.length
  if (!total) return
  const nextIndex = activeIndex.value + offset
  activeIndex.value = (nextIndex + total) % total
}

const goToActiveResult = () => {
  const current = results.value[activeIndex.value]
  if (!current) return
  void goToResult(current)
}

const isTextInputElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false
  const tagName = target.tagName
  return (
    tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target.isContentEditable
  )
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.isComposing) return

  const isSlashKey = event.key === '/'
  if (
    isSlashKey &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !isTextInputElement(event.target)
  ) {
    event.preventDefault()
    void openSearch()
    return
  }

  if (!isOpen.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeSearch()
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activateResultByOffset(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activateResultByOffset(-1)
    return
  }

  if (event.key === 'Enter' && results.value.length) {
    event.preventDefault()
    goToActiveResult()
  }
}

watch(results, (nextResults) => {
  if (!nextResults.length) {
    activeIndex.value = 0
    return
  }
  if (activeIndex.value > nextResults.length - 1) {
    activeIndex.value = 0
  }
})

watch(keywordValue, () => {
  activeIndex.value = 0
})

watch(activeIndex, () => {
  nextTick(() => {
    const activeNode = listRef.value?.querySelector<HTMLElement>(
      `[data-result-index="${activeIndex.value}"]`,
    )
    activeNode?.scrollIntoView({ block: 'nearest' })
  })
})

watch(isOpen, (opened) => {
  lockBodyScroll(opened)
  if (opened) {
    activeIndex.value = 0
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  lockBodyScroll(false)
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <button class="Search" type="button" aria-label="打开搜索" @click="openSearch">
    <div class="text">
      <Icon icon="fe:search" />
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
            <Icon class="searchIcon" icon="fe:search" />
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

          <div class="SearchDialogBody">
            <div v-if="isLoading" class="SearchState">正在准备索引...</div>
            <div v-else-if="shouldShowEmptyState" class="SearchState">
              没有找到匹配文章，换个关键词试试
            </div>
            <div v-else-if="!keywordValue" class="SearchState">输入关键词后开始搜索，支持标题与正文。</div>
            <ul v-else ref="listRef" class="SearchList" role="listbox" aria-label="搜索结果">
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
                    v-for="(segment, segmentIndex) in splitHighlightSegments(item.title, keywordValue)"
                    :key="`${item.id}-title-${segmentIndex}`"
                  >
                    <mark v-if="segment.match">{{ segment.text }}</mark>
                    <span v-else>{{ segment.text }}</span>
                  </template>
                </p>

                <p class="snippet">
                  <template
                    v-for="(segment, segmentIndex) in splitHighlightSegments(item.snippet, keywordValue)"
                    :key="`${item.id}-snippet-${segmentIndex}`"
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
