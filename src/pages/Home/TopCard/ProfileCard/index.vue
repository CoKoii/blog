<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ownerProfile, socialLinks } from '@/config'


const handleAction = (message: string) => {
  alert(message)
}
</script>

<template>
  <div class="profile-box">
    <section class="card">
      <div class="grid">
        <div class="avatar" aria-label="avatar">
          <img v-lazy="ownerProfile.avatar" alt="Avatar" />
          <span class="status-dot"></span>
        </div>

        <div>
          <h1 class="title">
            {{ ownerProfile.greeting }} <span aria-hidden="true">{{ ownerProfile.greetingEmoji }}</span>
          </h1>

          <p class="subtitle">{{ ownerProfile.headline }}</p>

          <p class="value">
            {{ ownerProfile.bio }}
            <span>{{ ownerProfile.bioEmphasis }}</span>
          </p>

          <div class="actions">
            <button class="btn primary" @click="handleAction('TODO: 跳转到 Projects')">
              View Projects
            </button>
            <button class="btn" @click="handleAction('TODO: 跳转到 About')">About Me</button>
            <button class="btn" @click="handleAction('TODO: 下载简历/打开 PDF')">Resume</button>
          </div>

          <ul class="chips" aria-label="skills">
            <li v-for="tag in ownerProfile.tags" :key="tag" class="chip">{{ tag }}</li>
          </ul>
        </div>
      </div>

      <div class="quote">{{ ownerProfile.quote }}</div>

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
