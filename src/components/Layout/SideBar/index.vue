<script setup lang="ts">
import menus from '@/router/menu'
import { Icon } from '@iconify/vue'
</script>

<template>
  <div class="sideBar">
    <div class="box" v-for="(item, index) in menus" :key="index">
      <div class="title" v-if="item.title">{{ item.title }}</div>
      <ul>
        <li v-for="child in item.children" :key="child.title">
          <router-link :to="child.path" active-class="active">
            <Icon :icon="child.icon" v-if="child.icon" />
            <div class="color" v-else :style="{ backgroundColor: child.color }"></div>
            <div class="text">{{ child.title }}</div>
          </router-link>
        </li>
      </ul>
    </div>
    <div class="box"></div>
  </div>
</template>

<style scoped lang="scss">
@use './style.scss';
</style>
