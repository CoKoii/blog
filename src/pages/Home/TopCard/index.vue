<script setup lang="ts">
import JourneyCard from './JourneyCard/index.vue'
import OpenSourceCard from './OpenSourceCard/index.vue'
import ProfileCard from './ProfileCard/index.vue'
import StatsCard from './StatsCard/index.vue'
import WechatCard from './WechatCard/index.vue'
</script>

<template>
  <div class="top-card">
    <div class="bento-grid">
      <ProfileCard class="bento-item bento-profile" />
      <OpenSourceCard class="bento-item bento-oss" />
      <StatsCard class="bento-item bento-stats" />
      <JourneyCard class="bento-item bento-journey" />
      <WechatCard class="bento-item bento-wechat" />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
