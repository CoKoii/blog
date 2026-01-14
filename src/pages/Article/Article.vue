<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

// 文章数据示例
const article = ref({
  title: '深入解析 CSS text-box-trim: 精确控制文本垂直间距的新方案',
  coverImage:
    'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxvZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1600&q=80)',
  tags: ['原创', '前端'],
  wordCount: 1800,
  readTime: 9,
  publishDate: '2025-12-23',
  views: 773,
  location: '广东 深圳',
  comments: 4,
})
</script>

<template>
  <div class="Article">
    <div class="cover_info">
      <!-- 背景图层 -->
      <div
        class="cover_background"
        :style="{
          backgroundImage: article.coverImage,
        }"
      ></div>
      <!-- 模糊遮罩 -->
      <div class="cover_overlay"></div>
      <!-- 文章信息 -->
      <div class="article_header">
        <div class="tags">
          <span v-for="hashTag in article.tags" :key="hashTag" class="tag hash">
            # {{ hashTag }}
          </span>
        </div>
        <h1 class="title">{{ article.title }}</h1>
        <div class="meta_info">
          <span class="meta_item">
            <Icon class="icon" icon="lucide:file-text" />
            {{ article.wordCount }}
          </span>
          <span class="meta_item">
            <Icon class="icon" icon="lucide:clock" />
            {{ article.readTime }}分钟
          </span>
          <span class="meta_item">
            <Icon class="icon" icon="lucide:calendar" />
            {{ article.publishDate }}
          </span>
          <span class="meta_item">
            <Icon class="icon" icon="lucide:eye" />
            {{ article.views }}
          </span>
          <span class="meta_item">
            <Icon class="icon" icon="lucide:map-pin" />
            {{ article.location }}
          </span>
          <span class="meta_item">
            <Icon class="icon" icon="lucide:message-circle" />
            {{ article.comments }}
          </span>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="article"></div>
      <div class="menus"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.Article {
  .cover_info {
    position: relative;
    width: 100%;
    height: 500px;
    overflow: hidden;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .cover_background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      z-index: 0;
    }

    &:hover .cover_background {
      transform: scale(1.05);
    }

    .cover_overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.2) 40%,
        rgba(0, 0, 0, 0.6) 80%,
        rgba(0, 0, 0, 0.85) 100%
      );
      z-index: 1;
    }

    .article_header {
      position: relative;
      width: 100%;
      padding: 40px;
      color: white;
      z-index: 2;
      box-sizing: border-box;

      .tags {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;

        .tag {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;

          &.hash {
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
          }

          &:hover {
            background-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
        }
      }

      .title {
        font-size: 42px;
        font-weight: 700;
        line-height: 1.3;
        margin: 0 0 24px 0;
        text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 900px;
      }

      .meta_info {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        font-size: 15px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);

        .meta_item {
          display: flex;
          align-items: center;
          gap: 6px;

          .icon {
            width: 18px;
            height: 18px;
            opacity: 0.9;
          }
        }
      }
    }
  }

  .content {
    display: flex;
    margin: 0 auto;
    padding: 24px 0px;
    gap: 20px;

    .article {
      flex: 3;
      min-height: 400px;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
    }

    .menus {
      flex: 1;
      min-height: 400px;
      background-color: #f0f0f0;
      border-radius: 8px;
      padding: 20px;
    }
  }
}

@media (max-width: 768px) {
  .Article {
    .cover_info {
      height: auto;
      min-height: 300px;

      .article_header {
        padding: 40px 20px;

        .title {
          font-size: 32px;
        }

        .meta_info {
          gap: 20px;
          font-size: 14px;
        }
      }
    }

    .content {
      flex-direction: column;
      padding: 20px 15px;
    }
  }
}
</style>
