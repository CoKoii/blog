<script setup lang="ts">
import Search from '@/components/Search/Search.vue'
import { brandName } from '@/config'
import { useLayoutStore } from '@/store/layout'
import { Icon } from '@iconify/vue'
import { Dropdown } from 'ant-design-vue'

const layoutStore = useLayoutStore()
</script>

<template>
  <div class="TopBar">
    <div class="title">
      <div class="icon" @click="layoutStore.toggleSideBar">
        <Icon icon="simple-line-icons:menu" />
      </div>
      <router-link to="/">
        <h4>{{ brandName }}</h4>
      </router-link>
    </div>
    <div class="search">
      <Search />
    </div>
    <div class="user">
      <Dropdown placement="bottomRight">
        <div class="avatar">
          <Icon icon="lucide:user" />
        </div>
        <template #overlay>
          <div class="avatar_dropdown">
            <div class="profile">profile</div>
            <div class="line"></div>
            <div class="tools">
              <div class="lang">lang</div>
              <div class="theme">theme</div>
            </div>
          </div>
        </template>
      </Dropdown>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './style.scss';
</style>
