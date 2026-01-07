<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

useHead({
  title: 'CaoKai - Digital Garden',
  meta: [{ name: 'description', content: 'Developer, Creator, Explorer' }],
})

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
    <header class="bento-grid"></header>

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
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: 160px 160px; // Fixed height rows for bento feel
  grid-template-areas:
    'hero hero quick stats'
    'hero hero journal links';
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: 180px 160px 160px;
    grid-template-areas:
      'hero hero'
      'quick stats'
      'journal links';
  }
  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto auto auto;
    grid-template-areas:
      'hero'
      'quick'
      'stats'
      'journal'
      'links';
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

.bento-item:nth-child(1) {
  grid-area: hero;
}

.bento-item:nth-child(2) {
  grid-area: quick;
}

.bento-item:nth-child(3) {
  grid-area: stats;
}

.bento-item:nth-child(4) {
  grid-area: journal;
}

.bento-item:nth-child(5) {
  grid-area: links;
}

// --- Specific Bento Blocks ---

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
</style>
