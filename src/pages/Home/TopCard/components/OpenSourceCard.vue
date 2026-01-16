<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { getRelativeTime } from '@/utils/date'
import ossData from '@/data/opensource.json'

defineOptions({
  name: 'OpenSourceCard',
})

const formatCount = (count: number) => {
  if (count < 1000) return `${count}`
  const value = count >= 10000 ? count / 1000 : Math.round((count / 1000) * 10) / 10
  return `${value}k`
}

const metaText = computed(() => {
  if (!ossData.updatedAt) return '更新于 Recently'
  return `更新于 ${getRelativeTime(ossData.updatedAt)}`
})
</script>

<template>
  <a
    class="os-card"
    aria-label="Open Source Projects"
    :href="ossData.profileUrl || '#'"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="top">
      <div class="badge">
        <span class="dot" aria-hidden="true"></span>
        <span>开源作品集</span>
      </div>

      <div class="pill" title="Open Source">
        <Icon class="icon" icon="lucide:github" />
        <span>Open Source</span>
      </div>
    </div>

    <p class="desc">可复用组件、工具与实验性项目的精选集合。</p>

    <div class="stats" aria-label="Open source stats">
      <div class="stat">
        <div class="k">Projects</div>
        <div class="v">{{ ossData.projects }}</div>
      </div>
      <div class="stat">
        <div class="k">Stars</div>
        <div class="v">{{ formatCount(ossData.stars) }}</div>
      </div>
    </div>

    <div class="bottom">
      <div class="cta">
        查看开源作品
        <Icon class="arrow" icon="lucide:arrow-right" />
      </div>

      <div class="meta" aria-label="time meta">{{ metaText }}</div>
    </div>
  </a>
</template>

<style scoped lang="scss">
.os-card {
  --card: #0f172a;
  --card2: #0b1220;
  --text: #e5e7eb;
  --muted: rgba(229, 231, 235, 0.68);
  --muted2: rgba(229, 231, 235, 0.46);
  --border: rgba(255, 255, 255, 0.08);
  --radius: 18px;

  position: relative;
  border-radius: var(--radius);
  background: linear-gradient(145deg, var(--card), var(--card2));
  overflow: hidden;
  text-decoration: none;
  color: var(--text);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  transition: border-color 0.14s ease;
  height: 100%;
  width: 100%;
  min-height: 180px;

  &::before {
    content: '';
    position: absolute;
    inset: -140px -160px auto auto;
    width: 320px;
    height: 320px;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0) 60%
    );
    filter: blur(10px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: auto auto -180px -180px;
    width: 420px;
    height: 420px;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0) 58%
    );
    filter: blur(12px);
    pointer-events: none;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.14);
  }

  &:focus-visible {
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
  }
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0;
  position: relative;
  z-index: 1;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text);

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #62d778;
    box-shadow: 0 0 4px #62d778;
  }
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  color: var(--muted);
  user-select: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    transform 0.12s ease;

  &::after {
    content: '';
    position: absolute;
    inset: -60% -20%;
    background: linear-gradient(
      120deg,
      transparent 30%,
      rgba(255, 255, 255, 0.45) 50%,
      transparent 70%
    );
    transform: translateX(-120%);
    opacity: 0;
    pointer-events: none;
  }

  &:focus-visible,
  &:active {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.16);
    transform: scale(0.98);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08);
  }

  &:hover::after,
  &:focus-visible::after,
  &:active::after {
    opacity: 0.7;
    transform: translateX(120%);
    transition:
      transform 0.35s ease,
      opacity 0.35s ease;
  }
}

.icon {
  width: 16px;
  height: 16px;
  opacity: 0.95;
}

.desc {
  position: relative;
  z-index: 1;
  margin: 12px 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
  max-width: 44ch;

  span {
    color: var(--muted2);
  }
}

.stats {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 18px;
  margin: 12px 0;
}

.stat {
  flex: 1 1 0;
  border: none;
  background: transparent;
  padding: 0;

  .k {
    font-size: 10px;
    color: var(--muted2);
    margin-bottom: 2px;
    letter-spacing: 0.02em;
  }

  .v {
    font-size: 13.5px;
    font-weight: 720;
    color: var(--text);
  }
}

.bottom {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  transition:
    background 0.14s ease,
    border-color 0.14s ease,
    transform 0.14s ease;

  &::after {
    content: '';
    position: absolute;
    inset: -70% -20%;
    background: linear-gradient(
      120deg,
      transparent 25%,
      rgba(255, 255, 255, 0.5) 50%,
      transparent 75%
    );
    transform: translateX(-130%);
    opacity: 0;
    pointer-events: none;
  }

  &:hover::after,
  &:focus-visible::after,
  &:active::after {
    opacity: 0.7;
    transform: translateX(130%);
    transition:
      transform 0.4s ease,
      opacity 0.4s ease;
  }
}

.os-card:hover .cta {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.arrow {
  width: 12px;
  height: 12px;
  opacity: 0.9;
}

.meta {
  font-size: 11px;
  color: var(--muted2);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

@media (prefers-reduced-motion: reduce) {
  .pill,
  .cta {
    transition: none;
    transform: none;
  }

  .pill::after,
  .cta::after {
    transition: none;
    opacity: 0;
  }
}
</style>
