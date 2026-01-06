<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

useHead({
  title: 'CaoKai - Digital Garden',
  meta: [{ name: 'description', content: 'Developer, Creator, Explorer' }],
})

// Data: Bento Grid Items
const status = ref({
  emoji: '⚡️',
  text: 'Building something cool',
  time: '14:23',
  weather: '24°C Sunny',
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

const quickLinks = [
  { name: 'Projects', icon: 'lucide:folder-heart', color: '#ff6b6b' },
  { name: 'Articles', icon: 'lucide:file-text', color: '#4ecdc4' },
  { name: 'Snippets', icon: 'lucide:code-2', color: '#ffe66d' },
  { name: 'Gallery', icon: 'lucide:image', color: '#1a535c' },
]

const projects = ref([
  {
    name: 'Hero-Admin',
    desc: 'Vue3 Enterprise Template',
    icon: 'lucide:layout-dashboard',
    color: 'from-purple-500 to-indigo-500',
    stars: '2.4k',
  },
  {
    name: 'Dev-Kit',
    desc: 'Rust based dev tools',
    icon: 'lucide:wrench',
    color: 'from-orange-400 to-red-500',
    stars: '856',
  },
])

const activeTab = ref('All')
const tabs = ['All', 'Dev', 'Life', 'Design']

const latestPosts = ref([
  {
    id: 1,
    title: '重构思维：如何写出像艺术品一样的代码',
    category: 'Architecture',
    time: '2 hrs ago',
    readTime: '5 min',
    hot: true,
  },
  {
    id: 2,
    title: 'CSS Grid 布局指南：打造 Bento 风格',
    category: 'Design',
    time: '1 day ago',
    readTime: '8 min',
    hot: true,
  },
  {
    id: 3,
    title: 'Rust 初体验：与 TypeScript 的爱恨纠葛',
    category: 'Backend',
    time: '3 days ago',
    readTime: '12 min',
    hot: false,
  },
  {
    id: 4,
    title: '2025 年度总结：在不确定性中寻找支点',
    category: 'Life',
    time: '1 week ago',
    readTime: '10 min',
    hot: false,
  },
  {
    id: 5,
    title: 'Vite 5.0 迁移踩坑记录',
    category: 'DevOps',
    time: '2 weeks ago',
    readTime: '6 min',
    hot: false,
  },
])

const groupedResources = [
  { title: 'Weekly Reads', count: 12, icon: 'lucide:book-open' },
  { title: 'Design Assets', count: 45, icon: 'lucide:palette' },
  { title: 'Code Snippets', count: 128, icon: 'lucide:scissors' },
]
</script>

<template>
  <div class="dashboard-page">
    <!-- Area 1: Bento Header (High Density Info) -->
    <header class="bento-grid">
      <!-- Block 1: Profile & Intro (Large) -->
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

      <!-- Block 2: Status & Time (Medium) -->
      <div class="bento-item status-box darker">
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

      <!-- Block 3: Tech Stack Marquee (Medium) -->
      <div class="bento-item stack-box">
        <div class="box-label"><Icon icon="lucide:cpu" /> Tech Stack</div>
        <div class="marquee-track">
          <div class="marquee-content">
            <Icon v-for="icon in techStack" :key="icon" :icon="icon" class="stack-icon" />
            <!-- Duplicate for infinite scroll -->
            <Icon v-for="icon in techStack" :key="icon + '_dup'" :icon="icon" class="stack-icon" />
          </div>
        </div>
      </div>

      <!-- Block 4: Featured Project (Small) -->
      <a href="#" class="bento-item project-box gradient-1">
        <div class="p-icon"><Icon icon="lucide:zap" /></div>
        <div class="p-info">
          <span class="name">Hero UI</span>
          <span class="desc">Design System</span>
        </div>
        <Icon icon="lucide:arrow-up-right" class="arrow" />
      </a>

      <!-- Block 5: Stats (Small) -->
      <div class="bento-item stats-box">
        <div class="stat-num">142</div>
        <div class="stat-label">Articles</div>
      </div>
    </header>

    <!-- Area 2: Main Content Split -->
    <main class="main-content">
      <!-- Left: Compact Feed -->
      <section class="feed-section">
        <div class="feed-header">
          <h2 class="section-title">
            <Icon icon="lucide:sparkles" class="title-icon" /> Latest Updates
          </h2>
          <div class="tabs">
            <button
              v-for="tab in tabs"
              :key="tab"
              :class="['tab-btn', { active: activeTab === tab }]"
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
          </div>
        </div>

        <div class="post-list">
          <div v-for="post in latestPosts" :key="post.id" class="post-row">
            <div class="post-marker" :class="{ hot: post.hot }"></div>
            <div class="post-main">
              <h3 class="post-title">{{ post.title }}</h3>
              <div class="post-meta">
                <span class="cat tag-pill">{{ post.category }}</span>
                <span class="dot">·</span>
                <span class="time">{{ post.time }}</span>
                <span class="dot">·</span>
                <span class="read">{{ post.readTime }} read</span>
              </div>
            </div>
            <button class="read-btn">Read</button>
          </div>
        </div>

        <div class="more-btn-wrapper">
          <button class="view-all-btn">View Archive</button>
        </div>
      </section>

      <!-- Right: Functional Sidebar -->
      <aside class="sidebar-section">
        <!-- Pinned Projects Grid -->
        <div class="sidebar-block">
          <h3 class="side-title">Pinned Projects</h3>
          <div class="mini-grid">
            <div v-for="p in projects" :key="p.name" class="mini-card">
              <div class="card-icon" :class="p.color">
                <Icon :icon="p.icon" />
              </div>
              <div class="card-text">
                <div class="card-name">{{ p.name }}</div>
                <div class="card-desc">{{ p.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resource List -->
        <div class="sidebar-block">
          <h3 class="side-title">Collections</h3>
          <ul class="resource-list">
            <li v-for="item in groupedResources" :key="item.title" class="res-item">
              <div class="res-left"><Icon :icon="item.icon" /> {{ item.title }}</div>
              <span class="res-count">{{ item.count }}</span>
            </li>
          </ul>
        </div>

        <!-- Newsletter / Ad -->
        <div class="sidebar-block ad-block">
          <div class="ad-content">
            <Icon icon="lucide:mail" class="ad-icon" />
            <h4>Subscribe Newsletter</h4>
            <p>Get the latest trends weekly.</p>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped lang="scss">
// --- Color System (Neo/Modern) ---
$bg-page: #f8f9fa;
$bg-card: #ffffff;
$text-primary: #111827;
$text-secondary: #6b7280;
$border-light: #e5e7eb;
$accent-color: #000; // Bold black for primary actions
$primary-hover-color: #7d2ae8;
$radius-xl: 24px;
$radius: 16px;

.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  color: $text-primary;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

// --- Layout Utilities ---
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 160px); // Fixed height rows for bento feel
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
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
    border-color: rgba(0, 0, 0, 0.08); // Slight dark border on hover
  }
}

// --- Specific Bento Blocks ---

// 1. Profile (Span 2x2)
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

// 2. Status Box (Dark Mode Block)
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

// 3. Stack Box (Overflow Marquee)
.stack-box {
  grid-column: span 1;
  grid-row: span 1;
  background: #fff;
  padding: 0; // Custom padding

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
    padding-bottom: 24px;
    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
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

// 4. Project Box (Gradient)
.project-box {
  grid-column: span 1;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  text-decoration: none;
  color: #fff;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;

  &.gradient-1 {
    background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  }

  .p-icon {
    font-size: 2rem;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.2);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }
  .name {
    font-size: 1.2rem;
    font-weight: 700;
    display: block;
  }
  .desc {
    font-size: 0.85rem;
    opacity: 0.9;
  }
  .arrow {
    position: absolute;
    top: 16px;
    right: 16px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover .arrow {
    opacity: 1;
  }
}

// 5. Stats Box
.stats-box {
  justify-content: center;
  align-items: center;
  background: #fff;
  border: 2px dashed #e5e7eb; // Dashed border style

  .stat-num {
    font-size: 2.5rem;
    font-weight: 800;
    color: #111;
    line-height: 1;
  }
  .stat-label {
    font-size: 0.9rem;
    color: #888;
    margin-top: 4px;
  }
}

// --- Main Content Area ---
.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// Feed Section
.feed-section {
  .feed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tabs {
      display: flex;
      gap: 8px;
      background: #eaecf0;
      padding: 4px;
      border-radius: 12px;
      .tab-btn {
        background: transparent;
        border: none;
        padding: 6px 16px;
        font-size: 0.85rem;
        font-weight: 600;
        color: #666;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .tab-btn.active {
        background: #fff;
        color: #000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
    }
  }
}

.post-list {
  display: flex;
  flex-direction: column;
}

.post-row {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
  cursor: pointer;
  position: relative;

  &:first-child {
    padding-top: 0;
  }
  &:hover {
    .post-title {
      color: $primary-hover-color;
    }
    .read-btn {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .post-marker {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ddd;
    margin-right: 16px;
    &.hot {
      background: #ff4757;
      box-shadow: 0 0 8px rgba(255, 71, 87, 0.4);
    } // Glowing red dot for hot posts
  }

  .post-main {
    flex: 1;
    .post-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
      transition: color 0.2s;
    }
    .post-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #888;
      .tag-pill {
        background: #f3f4f6;
        padding: 2px 8px;
        border-radius: 4px;
        color: #555;
        font-weight: 500;
        font-size: 0.75rem;
      }
      .dot {
        font-weight: bold;
        color: #ccc;
      }
    }
  }

  .read-btn {
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.2s;
    background: #111;
    color: #fff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
  }
}

.more-btn-wrapper {
  margin-top: 24px;
  text-align: center;
  .view-all-btn {
    background: #f3f4f6;
    border: none;
    padding: 12px 30px;
    border-radius: 99px;
    font-weight: 600;
    color: #555;
    cursor: pointer;
    transition: 0.2s;
    &:hover {
      background: #e5e7eb;
    }
  }
}

// Sidebar
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-block {
  background: #fff;
  border-radius: $radius;
  padding: 20px;
  border: 1px solid #f0f0f0;

  .side-title {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: #111;
  }
}

.mini-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.mini-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1px solid transparent;
  transition: 0.2s;
  cursor: pointer;

  &:hover {
    background: #fff;
    border-color: #ddd;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }

  .card-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 1.1rem;
    &.from-purple-500 {
      background: linear-gradient(135deg, #a855f7, #6366f1);
    }
    &.from-orange-400 {
      background: linear-gradient(135deg, #fb923c, #ef4444);
    }
  }

  .card-text {
    .card-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #333;
    }
    .card-desc {
      font-size: 0.75rem;
      color: #888;
    }
  }
}

.resource-list {
  padding: 0;
  margin: 0;
  list-style: none;
  .res-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px dashed #eee;
    font-size: 0.9rem;
    color: #555;
    cursor: pointer;
    &:last-child {
      border-bottom: none;
    }
    &:hover {
      color: #000;
    }
    .res-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .res-count {
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      color: #888;
    }
  }
}

.ad-block {
  background: #111;
  color: #fff;
  text-align: center;
  padding: 30px 20px;

  .ad-icon {
    font-size: 2rem;
    margin-bottom: 12px;
    opacity: 0.8;
  }
  h4 {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }
  p {
    font-size: 0.85rem;
    opacity: 0.6;
  }
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
