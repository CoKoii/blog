<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

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

<style scoped lang="scss" src="./style.scss"></style>
