<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { wechatConfig } from '@/config'
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

<style scoped lang="scss" src="./style.scss"></style>
