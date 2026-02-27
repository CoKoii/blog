<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const msgs = [
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

type Item = { id: number; text: string; top: number; left: number; duration: number }

const items = ref<Item[]>([])
const timers = new Set<number>()
let interval: number | undefined
const MAX_ITEMS = 10

const rand = (min: number, max: number) => Math.random() * (max - min) + min

const spawn = () => {
  const id = Date.now() + Math.floor(Math.random() * 1000)
  const item: Item = {
    id,
    text: msgs[Math.floor(Math.random() * msgs.length)] ?? '',
    top: rand(10, 90),
    left: rand(10, 90),
    duration: rand(2.8, 4.2),
  }

  items.value.push(item)
  if (items.value.length > MAX_ITEMS) items.value.shift()

  const tid = window.setTimeout(() => {
    items.value = items.value.filter((d) => d.id !== id)
    timers.delete(tid)
  }, item.duration * 1000)
  timers.add(tid)
}

onMounted(() => {
  for (let i = 0; i < 3; i++) spawn()
  interval = window.setInterval(spawn, 1000)
})

onBeforeUnmount(() => {
  if (interval != null) window.clearInterval(interval)
  timers.forEach((t) => window.clearTimeout(t))
  timers.clear()
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
        v-for="item in items"
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
