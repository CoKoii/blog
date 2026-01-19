<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { wechatConfig } from '@/config'

defineOptions({
  name: 'WechatCard',
})
</script>

<template>
  <div class="wechat-box">
    <button class="wx-card" type="button" aria-label="微信公众号卡片：悬停翻转显示二维码">
      <div class="wx-inner">
        <Icon class="wx-bg" icon="simple-icons:wechat" aria-hidden="true" />

        <div class="flip">
          <div class="flip-inner">
            <div class="face front">
              <div class="left">
                <div class="title">公众号 <span class="tag">微信</span></div>
                <div class="sub">快人一步获取最新文章</div>
              </div>
              <Icon class="arrow" icon="lucide:arrow-right" aria-hidden="true" />
            </div>

            <div class="face back">
              <div class="left">
                <div class="title">扫一扫</div>
                <div class="sub">不错过精彩文章</div>
              </div>
              <div class="qr" aria-hidden="true">
                <img :src="wechatConfig.qrUrl" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  </div>
</template>

<style scoped lang="scss">
.wechat-box {
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  height: 100%;
  width: 100%;
}

.wx-card {
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  cursor: pointer;
  background: transparent;
}

.wx-inner {
  --wx: #6ed56c;
  --wx-dark: #2f9d5b;
  --text: #ffffff;
  --shadow: 0 18px 50px rgba(17, 24, 39, 0.12);
  --radius: 18px;
  --border: rgba(255, 255, 255, 0.18);

  width: 100%;
  height: 100%;
  min-height: 180px;
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  background: linear-gradient(135deg, var(--wx), var(--wx-dark));
  transform-style: preserve-3d;
  outline: none;
}

.wx-card:focus-visible .wx-inner {
  box-shadow:
    0 0 0 4px rgba(17, 24, 39, 0.1),
    var(--shadow);
}

.wx-bg {
  position: absolute;
  right: -10px;
  top: 28px;
  width: 140px;
  height: 140px;
  opacity: 0.22;
  filter: blur(3px);
  color: #ffffff;
  transform: translateY(0);
  transition:
    transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.55s cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
}

.flip {
  position: absolute;
  inset: 0;
  padding: 18px;
  display: grid;
  align-items: center;
  perspective: 900px;
}

.flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  backface-visibility: hidden;
}

.front .left,
.back .left {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--text);
  min-width: 0;
  text-align: left;
  align-items: flex-start;
}

.front .title {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.05;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.front .tag {
  font-size: 12px;
  font-weight: 750;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid var(--border);
}

.front .sub,
.back .sub {
  font-size: 18px;
  font-weight: 750;
  opacity: 0.92;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.front .arrow {
  width: 20px;
  height: 20px;
  opacity: 0.92;
  flex: 0 0 auto;
  margin-left: 8px;
  color: #ffffff;
}

.back {
  transform: rotateY(180deg);
}

.back .title {
  font-size: 36px;
  font-weight: 950;
  letter-spacing: -0.02em;
  line-height: 1.05;
  white-space: nowrap;
}

.qr {
  width: 105px;
  height: 105px;
  border-radius: 10px;
  background: #ffffff;
  padding: 6px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.16);
  flex: 0 0 auto;
}

.qr img {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 6px;
  object-fit: cover;
}

.wx-card:hover .flip-inner,
.wx-card:focus-within .flip-inner {
  transform: rotateY(180deg);
}

.wx-card:hover .wx-bg,
.wx-card:focus-within .wx-bg {
  transform: translateY(36px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .flip-inner,
  .wx-bg {
    transition: none;
  }
}
</style>
