<script setup lang="ts">
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
              <h1 class="title">
                Hi, I'm CaoKai <span aria-hidden="true">👋</span>
              </h1>

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
                <button class="btn" @click="handleAction('TODO: 下载简历/打开 PDF')">
                  Resume
                </button>
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

      <a class="bento-item status-box os-card" href="/open-source.html" aria-label="Open Source Projects">
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
      </a>

      <div class="bento-item stack-box">
        <div class="box-label"><Icon icon="lucide:cpu" /> Tech Stack</div>
        <div class="marquee-track">
          <div class="marquee-content">
            <Icon v-for="icon in techStack" :key="icon" :icon="icon" class="stack-icon" />
            <Icon v-for="icon in techStack" :key="icon + '_dup'" :icon="icon" class="stack-icon" />
          </div>
        </div>
      </div>

      <div class="bento-item placeholder-box">
        <div class="placeholder-content">
          <Icon icon="lucide:layout-dashboard" class="placeholder-icon" />
          <div class="placeholder-title">Placeholder</div>
          <div class="placeholder-desc">灰色占位</div>
        </div>
      </div>

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
