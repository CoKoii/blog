<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

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

const status = ref({
  emoji: '⚡️',
  text: 'Building something cool',
  time: '14:23',
  weather: '24°C Sunny',
})
</script>

<template>
  <div class="top-card">
    <div class="bento-grid">
      <div class="bento-item profile-box">
        <div class="profile-header">
          <div class="avatar">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=CaoKai" alt="avatar" />
            <div class="online-dot"></div>
          </div>
          <div class="intro-text">
            <div class="greeting">
              Hi, I'm <span class="highlight">CaoKai</span> <span class="wave">👋</span>
            </div>
            <p class="role">
              Frontend Engineer & <br />
              UI Designer
            </p>
          </div>
        </div>
        <div class="bio-footer">
          <p>热衷于用代码构建美观、流畅的交互体验。</p>
          <div class="social-dock">
            <a href="#"><Icon icon="lucide:github" /></a>
            <a href="#"><Icon icon="lucide:twitter" /></a>
            <a href="#"><Icon icon="lucide:dribbble" /></a>
          </div>
        </div>
      </div>

      <div class="bento-item status-box">
        <div class="status-row">
          <span class="emoji">{{ status.emoji }}</span>
          <div class="status-info">
            <span class="label">Current Focus</span>
            <span class="value">{{ status.text }}</span>
          </div>
        </div>
        <div class="weather-row">
          <div class="loc"><Icon icon="lucide:map-pin" /> Shanghai, CN</div>
          <div class="time">{{ status.time }}</div>
        </div>
      </div>

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
