<script setup lang="ts">
import { siteOwner, socialLinks } from '@/config'
import { Icon } from '@iconify/vue'

const handleClickAction = (message: string) => alert(message)
</script>

<template>
  <div class="profile-box">
    <section class="card">
      <div class="grid">
        <div class="avatar" aria-label="avatar">
          <img v-lazy="siteOwner.avatar" alt="Avatar" />
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
