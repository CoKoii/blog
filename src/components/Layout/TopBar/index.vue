<script setup lang="ts">
import Search from '@/components/Search/Search.vue'
</script>

<template>
  <div class="TopBar">
    <div class="title">
      <router-link to="/">
        <h4>CaoKai</h4>
      </router-link>
    </div>
    <div class="search">
      <Search />
    </div>
    <div class="avatar">avatar</div>
  </div>
</template>

<style scoped lang="scss">
@use './style.scss';
</style>
