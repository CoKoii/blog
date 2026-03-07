<script setup lang="ts">
import { Icon } from '@/components/Icon'
import { siteOwner, socialLinks } from '@/config'
import { createDensityImageSource, createResponsiveImageSource } from '@/utils/image'

const handleClickAction = (message: string) => window.alert(message)

const wallpaperImage = createResponsiveImageSource(siteOwner.wallpaper, {
  srcWidth: 1200,
  widths: [640, 960, 1280, 1600],
  sizes: '(max-width: 1000px) 100vw, 50vw',
  quality: 80,
  format: 'webp',
})
const avatarImage = createDensityImageSource(siteOwner.avatar, {
  sizes: '72px',
  quality: 80,
  mode: 'm_fill',
  variants: [
    { width: 128, height: 128, descriptor: '1x' },
    { width: 256, height: 256, descriptor: '2x' },
  ],
})
</script>

<template>
  <div class="profile-box">
    <section class="card" :style="{ '--card-hue': siteOwner.wallpaperHue }">
      <img
        v-if="wallpaperImage.src"
        class="wallpaper"
        :src="wallpaperImage.src"
        :srcset="wallpaperImage.srcset"
        :sizes="wallpaperImage.sizes"
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        fetchpriority="high"
      />
      <div class="card-overlay" aria-hidden="true"></div>
      <div class="grid">
        <div class="avatar" aria-label="avatar">
          <img
            :src="avatarImage.src"
            :srcset="avatarImage.srcset"
            :sizes="avatarImage.sizes"
            width="128"
            height="128"
            alt="Avatar"
            loading="eager"
            decoding="async"
          />
          <span class="status-dot"></span>
        </div>

        <div class="content">
          <h1 class="title">
            {{ siteOwner.greeting }}
            <span aria-hidden="true">{{ siteOwner.greetingEmoji }}</span>
          </h1>

          <p class="subtitle">{{ siteOwner.headline }}</p>

          <p class="value">
            {{ siteOwner.bio }}
            <span>{{ siteOwner.bioEmphasis }}</span>
          </p>

          <div class="actions">
            <button class="btn primary" @click="handleClickAction('TODO: 跳转到 Projects')">
              View Projects
            </button>
            <button class="btn" @click="handleClickAction('TODO: 跳转到 About')">About Me</button>
            <button class="btn" @click="handleClickAction('TODO: 下载简历/打开 PDF')">
              Resume
            </button>
          </div>

          <ul class="chips" aria-label="skills">
            <li v-for="tag in siteOwner.tags" :key="tag" class="chip">{{ tag }}</li>
          </ul>
        </div>
      </div>

      <div class="quote">{{ siteOwner.quote }}</div>

      <div class="social" aria-label="social links">
        <a
          v-for="social in socialLinks"
          :key="social.label"
          class="icon-btn"
          :href="social.url"
          :title="social.label"
          :aria-label="social.label"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon class="icon" :icon="social.icon" />
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
