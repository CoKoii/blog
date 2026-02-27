<script setup lang="ts">
import { getCommentCountByPath, getCommentDetailsByPath } from '@/data/github'
import type { GithubCommentDetail } from '@/types/github'
import { Icon } from '@iconify/vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const PREVIEW_LIMIT = 2

const route = useRoute()
const routePath = computed(() => route.path || '/')
const totalCount = computed(() => getCommentCountByPath(routePath.value))
const previewComments = computed<GithubCommentDetail[]>(() =>
  getCommentDetailsByPath(routePath.value).slice(0, PREVIEW_LIMIT),
)
const hasComments = computed(() => totalCount.value > 0)
const isClosed = ref(false)
const summaryText = computed(() =>
  hasComments.value ? (totalCount.value <= 1 ? '最近有 1 条互动' : `最近有 ${totalCount.value} 条互动`) : '还没有评论，快来抢沙发',
)

watch(routePath, () => {
  isClosed.value = false
})

const toAvatarFallback = (value: string) => {
  const text = String(value || '').trim()
  return text ? text.slice(0, 1).toUpperCase() : '匿'
}

const getScrollOffset = () => {
  const topBar = document.querySelector('.Layout .topBar')
  const topBarHeight =
    topBar instanceof HTMLElement
      ? topBar.getBoundingClientRect().height
      : Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--layout-topbar-height'),
        ) || 0
  return topBarHeight + 16
}

const scrollToComments = () => {
  if (typeof window === 'undefined') return
  const target = document.getElementById('giscus-comments')
  if (!target) return

  const getTargetTop = () => {
    const y = target.getBoundingClientRect().top + window.scrollY - getScrollOffset()
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    return Math.min(Math.max(0, y), maxTop)
  }

  const scroll = (behavior: ScrollBehavior) => {
    window.scrollTo({ top: getTargetTop(), behavior })
  }

  scroll('smooth')

  // After lazy images/iframe resize the page, nudge scroll to the corrected position.
  let attempts = 0
  const settleAndFix = () => {
    attempts += 1
    const targetTop = getTargetTop()
    if (Math.abs(window.scrollY - targetTop) <= 8 || attempts >= 4) return
    scroll('auto')
    window.setTimeout(settleAndFix, 220)
  }

  window.setTimeout(settleAndFix, 360)
}

const closeBubble = () => {
  isClosed.value = true
}

const toTimeText = (value: string) => {
  const raw = String(value || '').trim()
  const day = raw.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return '近期'
  return day.slice(5).replace('-', '.')
}
</script>

<template>
  <section v-if="!isClosed" class="CommentBubbles" :class="{ 'is-empty': !hasComments }" aria-label="评论摘要">
    <header class="header">
      <p class="title">
        <Icon class="title-icon" icon="lucide:message-circle" />
        {{ summaryText }}
      </p>
      <button class="jump-btn" type="button" @click="scrollToComments">{{
        hasComments ? '查看评论区' : '去评论区'
      }}</button>
    </header>
    <button class="close-btn" type="button" aria-label="关闭评论浮层" @click="closeBubble">
      <Icon icon="lucide:x" />
    </button>

    <ul class="comment-list" v-if="previewComments.length">
      <li
        v-for="(comment, index) in previewComments"
        :key="`${comment.id}-${comment.createdAt}-${index}`"
        class="comment-item"
      >
        <div class="avatar-wrap">
          <img v-if="comment.avatarUrl" v-lazy="comment.avatarUrl" class="avatar" alt="" />
          <span v-else class="avatar-fallback">{{ toAvatarFallback(comment.author) }}</span>
        </div>
        <div class="comment-content">
          <p class="meta">
            <span class="author">{{ comment.author }}</span>
            <time class="time" :datetime="comment.createdAt">{{ toTimeText(comment.createdAt) }}</time>
          </p>
          <p class="text">{{ comment.body }}</p>
        </div>
      </li>
    </ul>

    <p class="empty-text" v-else>你的观点很重要，快来写下第一条评论。</p>
  </section>
</template>

<style scoped lang="scss" src="./style-bubbles.scss"></style>
