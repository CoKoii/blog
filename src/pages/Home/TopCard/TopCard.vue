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
  <div class="TopCard">
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
$bg-card: #ffffff;
$text-secondary: #6b7280;
$accent-color: #000;
$radius-xl: 24px;

.TopCard {
  padding: 24px;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(2, 160px);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: auto;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.bento-item {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.03);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 0, 0, 0.08);
  }
}

.profile-box {
  grid-column: span 2;
  grid-row: span 2;
  justify-content: space-between;
  background: linear-gradient(135deg, #fff 0%, #f3f4f6 100%);

  .profile-header {
    display: flex;
    gap: 20px;
    align-items: center;

    .avatar {
      width: 80px;
      height: 80px;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 4px solid #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .online-dot {
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 16px;
        height: 16px;
        background: #10b981;
        border: 2px solid #fff;
        border-radius: 50%;
      }
    }
  }

  .intro-text {
    .greeting {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 4px;
    }
    .role {
      font-size: 1.1rem;
      color: $text-secondary;
      line-height: 1.4;
    }
    .wave {
      display: inline-block;
      animation: wave 2.5s infinite;
      transform-origin: 70% 70%;
    }
  }

  .bio-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    p {
      max-width: 60%;
      font-size: 0.95rem;
      color: #555;
    }

    .social-dock {
      display: flex;
      gap: 12px;
      background: #fff;
      padding: 8px 12px;
      border-radius: 99px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

      a {
        color: #333;
        font-size: 1.2rem;
        transition: transform 0.2s;
        &:hover {
          color: $accent-color;
          transform: scale(1.1);
        }
      }
    }
  }
}

.status-box {
  grid-column: span 1;
  grid-row: span 1;
  background: #1f2937;
  color: #fff;
  justify-content: space-between;
  padding: 24px;

  .status-row {
    .emoji {
      font-size: 2rem;
      display: block;
      margin-bottom: 8px;
    }
    .label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.6;
      margin-bottom: 4px;
    }
    .value {
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.3;
    }
  }

  .weather-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    opacity: 0.7;
    margin-top: auto;

    .loc {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.stack-box {
  grid-column: span 1;
  grid-row: span 1;
  background: #fff;
  padding: 0;
  display: flex;
  flex-direction: column;

  .box-label {
    padding: 16px 20px 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
  }

  .marquee-track {
    overflow: hidden;
    white-space: nowrap;
    position: relative;
    padding: 8px 0 16px;
    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
    display: flex;
    align-items: center;
    flex: 1;
  }

  .marquee-content {
    display: inline-flex;
    gap: 24px;
    animation: scroll 20s linear infinite;
    padding-left: 20px;

    .stack-icon {
      font-size: 2.5rem;
      filter: grayscale(100%);
      opacity: 0.6;
      transition: all 0.3s;
      &:hover {
        filter: grayscale(0);
        opacity: 1;
        transform: scale(1.1);
      }
    }
  }
}

.placeholder-box {
  grid-column: span 1;
  grid-row: span 1;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px dashed rgba(0, 0, 0, 0.08);
  justify-content: center;
  align-items: center;
  text-align: center;

  .placeholder-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .placeholder-icon {
    font-size: 1.6rem;
    opacity: 0.7;
  }

  .placeholder-title {
    font-weight: 600;
    color: #4b5563;
  }

  .placeholder-desc {
    font-size: 0.85rem;
  }
}

.stats-box {
  grid-column: span 1;
  grid-row: span 1;
  justify-content: center;
  align-items: center;
  text-align: center;

  .stat-num {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
  }

  .stat-label {
    font-size: 0.9rem;
    color: $text-secondary;
  }
}

.highlight {
  color: $accent-color;
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(14deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  30% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
