<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

defineOptions({
  name: 'TopCard',
})

const techStack = [
  'logos:vue',
  'logos:typescript-icon',
  'logos:vitejs',
  'logos:react',
  'logos:tailwindcss-icon',
  'logos:nodejs-icon',
  'logos:rust',
  'logos:figma',
]

const handleAction = (message: string) => {
  alert(message)
}

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
  <div class="top-card">
    <div class="bento-grid">
      <div class="bento-item profile-box">
        <section class="card">
          <div class="grid">
            <div class="avatar" aria-label="avatar">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces"
                alt="Avatar"
              />
              <span class="status-dot" aria-label="online"></span>
            </div>

            <div>
              <h1 class="title">Hi, I'm CaoKai <span aria-hidden="true">👋</span></h1>

              <p class="subtitle">Frontend Engineer & UI Designer</p>

              <p class="value">
                I design and build thoughtful web products
                <span>— with a focus on clarity, performance, and tiny details.</span>
              </p>

              <div class="actions">
                <button class="btn primary" @click="handleAction('TODO: 跳转到 Projects')">
                  View Projects
                </button>
                <button class="btn" @click="handleAction('TODO: 跳转到 About')">About Me</button>
                <button class="btn" @click="handleAction('TODO: 下载简历/打开 PDF')">Resume</button>
              </div>

              <ul class="chips" aria-label="skills">
                <li class="chip">React</li>
                <li class="chip">TypeScript</li>
                <li class="chip">Next.js</li>
                <li class="chip">Figma</li>
                <li class="chip">Design Systems</li>
              </ul>
            </div>
          </div>

          <div class="quote">我见青山多妩媚，料青山见我应如是</div>

          <div class="social" aria-label="social links">
            <a class="icon-btn" href="#" title="GitHub" aria-label="GitHub">
              <Icon class="icon" icon="lucide:github" />
            </a>

            <a class="icon-btn" href="#" title="Twitter / X" aria-label="Twitter">
              <Icon class="icon" icon="lucide:twitter" />
            </a>

            <a class="icon-btn" href="#" title="Dribbble" aria-label="Dribbble">
              <Icon class="icon" icon="lucide:dribbble" />
            </a>
          </div>
        </section>
      </div>

      <router-link to="" class="bento-item status-box os-card" aria-label="Open Source Projects">
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
            <div class="v">12</div>
          </div>
          <div class="stat">
            <div class="k">Stars</div>
            <div class="v">1.4k</div>
          </div>
        </div>

        <div class="bottom">
          <div class="cta">
            查看开源作品
            <Icon class="arrow" icon="lucide:arrow-right" />
          </div>

          <div class="meta" aria-label="time meta">更新于 2 天前</div>
        </div>
      </router-link>

      <div class="bento-item stack-box">
        <div class="box-label"><Icon icon="lucide:cpu" /> Tech Stack</div>
        <div class="marquee-track">
          <div class="marquee-content">
            <div class="marquee-group">
              <Icon v-for="icon in techStack" :key="icon" :icon="icon" class="stack-icon" />
            </div>
            <div class="marquee-group" aria-hidden="true">
              <Icon
                v-for="icon in techStack"
                :key="icon + '_dup'"
                :icon="icon"
                class="stack-icon"
              />
            </div>
          </div>
        </div>
      </div>

      <router-link
        to="/journey"
        class="bento-item journey-box journey-card"
        aria-label="打开人生足迹时间线页面"
      >
        <div class="top">
          <div class="left">
            <div class="icon-wrap" aria-hidden="true">
              <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 7.5c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3Z"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <path
                  d="M14 16.5c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3Z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  opacity=".9"
                />
                <path
                  d="M10 10.5c2.2 0 3.4 1 4.2 2.1.8 1.1 1.8 2.4 4.8 2.4"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  opacity=".65"
                />
              </svg>
            </div>
            <div>
              <p class="title">人生足迹</p>
              <p class="sub">Journey</p>
            </div>
          </div>

          <svg class="arrow" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13 5 20 12l-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5Z" />
          </svg>
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

      <div class="bento-item stats-box">
        <div class="stat-num">142</div>
        <div class="stat-label">Articles</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './style.scss';
</style>
