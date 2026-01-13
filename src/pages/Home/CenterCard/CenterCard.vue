<script setup lang="ts">
defineOptions({
  name: 'CenterCard',
})
</script>

<template>
  <div class="CenterCard">
    <div class="center_main">主体内容区域</div>
    <div class="center_side">侧边栏内容</div>
  </div>
</template>

<style scoped lang="scss">
.CenterCard {
  display: flex;
  gap: 16px;
  .center_main {
    flex: 1;
    background-color: red;
  }
  .center_side {
    width: calc(25% - 32px);
    background-color: blue;
  }
}
</style>
