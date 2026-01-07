<script setup lang="ts">
import ProfileCard from './components/ProfileCard.vue'
import OpenSourceCard from './components/OpenSourceCard.vue'
import StatsCard from './components/StatsCard.vue'
import JourneyCard from './components/JourneyCard.vue'
import WechatCard from './components/WechatCard.vue'

defineOptions({
  name: 'TopCard',
})
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

<style scoped lang="scss">
.top-card {
  .bento-grid {
    display: grid;
    grid-template-columns:
      minmax(0, 1.2fr)
      minmax(0, 1fr)
      minmax(0, 1fr)
      minmax(0, 1fr);
    grid-template-rows: 180px 180px;
    grid-template-areas:
      'profile profile oss stats'
      'profile profile journey wechat';
    gap: 16px;

    @media (max-width: 1800px) {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-rows: 380px 180px 180px;
      grid-template-areas:
        'profile profile'
        'oss stats'
        'journey wechat';
    }

    @media (max-width: 1000px) {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows:
        minmax(350px, auto) minmax(180px, auto) minmax(180px, auto) minmax(180px, auto)
        minmax(180px, auto);
      grid-template-areas:
        'profile'
        'oss'
        'stats'
        'journey'
        'wechat';
    }
  }

  .bento-profile {
    grid-area: profile;
  }

  .bento-oss {
    grid-area: oss;
  }

  .bento-stats {
    grid-area: stats;
  }

  .bento-journey {
    grid-area: journey;
  }

  .bento-wechat {
    grid-area: wechat;
  }
}
</style>
