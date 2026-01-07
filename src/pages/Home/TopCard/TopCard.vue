<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

defineOptions({
  name: 'TopCard',
})

const statsConfig = {
  startDate: '2026-01-04',
  articles: 142,
  words: 238400,
  name: '安知鱼',
  motto: '生活明朗，万物可爱',
}

const statsDays = ref('—')

const formatK = (value: number) => {
  if (!Number.isFinite(value)) return '—'
  const kValue = value / 1000
  const decimals = kValue >= 100 ? 0 : 1
  return `${kValue.toFixed(decimals)}k`
}

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

  const start = new Date(`${statsConfig.startDate}T00:00:00`)
  const now = new Date()
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.max(0, Math.round((nowDay.getTime() - startDay.getTime()) / 86400000))
  statsDays.value = String(diff)
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
        <section class="stats-card" aria-label="网站统计">
          <div class="stats-metrics">
            <div class="stats-metric">
              <div class="stats-v">{{ statsDays }}</div>
              <div class="stats-k">建站天数</div>
            </div>
            <div class="stats-metric">
              <div class="stats-v">{{ statsConfig.articles }}</div>
              <div class="stats-k">文章总数</div>
            </div>
            <div class="stats-metric">
              <div class="stats-v">{{ formatK(statsConfig.words) }}</div>
              <div class="stats-k">全站字数</div>
            </div>
          </div>

          <div class="stats-actions" aria-label="RSS 订阅">
            <a class="stats-action" href="/feed.xml" aria-label="RSS" title="RSS">
              <svg class="stats-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-2-7v3c5 0 9 4 9 9h3c0-6.6-5.4-12-12-12Zm0-7v3c9.4 0 17 7.6 17 17h3C24 12.4 13.6 2 4 2Z" />
              </svg>
            </a>
            <a class="stats-action" href="/atom.xml" aria-label="Atom" title="Atom">
              <svg class="stats-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm0 2a8 8 0 1 1-8 8 8.01 8.01 0 0 1 8-8Zm0 3.2a4.8 4.8 0 1 0 4.8 4.8A4.81 4.81 0 0 0 12 7.2Zm0 2a2.8 2.8 0 1 1-2.8 2.8A2.8 2.8 0 0 1 12 9.2Z" />
              </svg>
            </a>
          </div>
        </section>
      </div>

      <router-link
        to="/journey"
        class="bento-item journey-box journey-card"
        aria-label="打开人生足迹时间线页面"
      >
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

      <div class="bento-item wechat-box">
        <button class="wx-card" type="button" aria-label="微信公众号卡片：悬停翻转显示二维码">
          <div class="wx-inner">
            <Icon class="wx-bg" icon="simple-icons:wechat" aria-hidden="true" />

            <div class="flip">
              <div class="flip-inner">
                <div class="face front">
                  <div class="left">
                    <div class="title">公众号 <span class="tag">微信</span></div>
                    <div class="sub">快人一步获取最新文章</div>
                  </div>
                  <Icon class="arrow" icon="lucide:arrow-right" aria-hidden="true" />
                </div>

                <div class="face back">
                  <div class="left">
                    <div class="title">扫一扫</div>
                    <div class="sub">不错过精彩文章</div>
                  </div>
                  <div class="qr" aria-hidden="true">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://weixin.qq.com/"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './style.scss';
</style>
