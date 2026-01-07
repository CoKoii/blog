<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({
  name: 'JourneyCard',
})

const barrageMessages = [
  '第一次实习',
  '赚到第一个 W',
  '第一次来杭州独居',
  '拿到第一台相机',
  '第一次独自旅行',
  '第一次发布开源项目',
  '第一次带新人',
  '第一次路演',
  '第一次通宵改稿',
]

type BarrageItem = {
  id: number
  text: string
  top: number
  left: number
  duration: number
}

const barrageItems = ref<BarrageItem[]>([])
const barrageTimers = new Set<number>()
let barrageInterval: number | undefined

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min

const spawnBarrage = () => {
  const id = Date.now() + Math.floor(Math.random() * 1000)
  const item: BarrageItem = {
    id,
    text: barrageMessages[Math.floor(Math.random() * barrageMessages.length)] ?? '',
    top: randomBetween(10, 90),
    left: randomBetween(10, 90),
    duration: randomBetween(2.8, 4.2),
  }

  barrageItems.value.push(item)

  if (barrageItems.value.length > 10) {
    barrageItems.value.shift()
  }

  const timeoutId = window.setTimeout(() => {
    barrageItems.value = barrageItems.value.filter((dm) => dm.id !== id)
    barrageTimers.delete(timeoutId)
  }, item.duration * 1000)
  barrageTimers.add(timeoutId)
}

onMounted(() => {
  for (let i = 0; i < 3; i += 1) {
    spawnBarrage()
  }
  barrageInterval = window.setInterval(spawnBarrage, 1000)
})

onBeforeUnmount(() => {
  if (barrageInterval) {
    window.clearInterval(barrageInterval)
  }
  barrageTimers.forEach((timer) => window.clearTimeout(timer))
  barrageTimers.clear()
})
</script>

<template>
  <router-link to="/journey" class="journey-box journey-card" aria-label="打开人生足迹时间线页面">
    <div class="top">
      <div class="left">
        <div class="icon-wrap" aria-hidden="true">
          <Icon class="icon" icon="lucide:waypoints" />
        </div>
        <div>
          <p class="title">人生足迹</p>
          <p class="sub">Journey</p>
        </div>
      </div>

      <Icon class="arrow" icon="lucide:arrow-right" aria-hidden="true" />
    </div>

    <div class="barrage" aria-hidden="true">
      <div
        v-for="item in barrageItems"
        :key="item.id"
        class="dm"
        :style="{
          top: `${item.top}%`,
          left: `${item.left}%`,
          animationDuration: `${item.duration}s`,
        }"
      >
        {{ item.text }}
      </div>
    </div>

    <div class="foot">
      <span class="initial-text">人生若只如初见</span>
      <span class="hover-text">何事秋风悲画扇</span>
    </div>
  </router-link>
</template>

<style scoped lang="scss">
.journey-box {
  --card: #ffffff;
  --bg: #fafafa;
  --text: #111827;
  --muted: #6b7280;
  --muted2: #9ca3af;
  --border: #ececec;
  --shadow: 0 18px 50px rgba(17, 24, 39, 0.08);
  --radius: 18px;

  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  display: block;
  height: 100%;
  width: 100%;
}

.journey-card {
  width: 100%;
  height: 100%;
  min-height: 180px;
  position: relative;
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition:
    transform 0.14s ease,
    border-color 0.14s ease,
    box-shadow 0.14s ease;
  outline: none;

  &:hover {
    border-color: #dedede;
    box-shadow: 0 22px 60px rgba(17, 24, 39, 0.1);
  }

  &:focus-visible {
    box-shadow:
      0 0 0 4px rgba(17, 24, 39, 0.08),
      var(--shadow);
  }

  &::before {
    content: '';
    position: absolute;
    inset: auto -90px -90px auto;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle at 30% 30%, rgba(17, 24, 39, 0.06), rgba(17, 24, 39, 0) 60%);
    filter: blur(10px);
    pointer-events: none;
  }
}

.top {
  position: absolute;
  top: 18px;
  left: 18px;
  right: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: #fff;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.icon {
  width: 18px;
  height: 18px;
  color: rgba(17, 24, 39, 0.78);
}

.title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 760;
  letter-spacing: -0.01em;
  line-height: 1.1;
}

.sub {
  margin: 5px 0 0;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.1;
}

.arrow {
  width: 18px;
  height: 18px;
  color: rgba(17, 24, 39, 0.55);
  opacity: 0.85;
  transition:
    transform 0.14s ease,
    opacity 0.14s ease;
}

.journey-card:hover .arrow {
  transform: translateX(2px);
  opacity: 1;
}

.barrage {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.dm {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
  white-space: nowrap;
  box-shadow: 0 10px 26px rgba(17, 24, 39, 0.06);
  animation: journey-fade-float ease-in-out both;
  will-change: opacity, transform;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgba(17, 24, 39, 0.35);
    flex: 0 0 auto;
  }
}

.foot {
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: 2;
  font-size: 11.5px;
  color: var(--muted2);
  letter-spacing: 0.02em;
  white-space: nowrap;

  .initial-text,
  .hover-text {
    transition: opacity 0.3s ease;
  }

  .hover-text {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
  }
}

.journey-card:hover .foot,
.journey-card:active .foot {
  .initial-text {
    opacity: 0;
  }

  .hover-text {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dm {
    animation: none;
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes journey-fade-float {
  0% {
    opacity: 0;
    transform: scale(0.98);
  }
  18% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px) scale(1.02);
  }
}
</style>
