<script setup lang="ts">
import { siteOwner } from '@/config'
import menus from '@/router/config/menu'
import { useLayoutStore } from '@/stores/layout'
import { Icon } from '@iconify/vue'
import { Tooltip } from 'ant-design-vue'

const layoutStore = useLayoutStore()
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="sideBar" :class="{ collapse: !layoutStore.isSideBarOpen }">
    <div class="sidebar-content">
      <div class="box" v-for="(item, index) in menus" :key="index">
        <div class="title" v-if="item.title">{{ item.title }}</div>
        <ul>
          <li v-for="child in item.children" :key="child.title">
            <Tooltip :title="!layoutStore.isSideBarOpen ? child.title : ''" placement="right">
              <router-link :to="child.path" active-class="" exact-active-class="active">
                <Icon :icon="child.icon" v-if="child.icon" />
                <div
                  class="color"
                  v-else
                  :style="{ backgroundColor: child.color, boxShadow: `0 0 4px ${child.color}` }"
                ></div>
                <div class="text">{{ child.title }}</div>
              </router-link>
            </Tooltip>
          </li>
        </ul>
      </div>
      <div class="box"></div>
    </div>

    <div class="sidebar-footer">
      <div class="copyright">
        <span>© {{ currentYear }} {{ siteOwner.name }}</span>
        <span class="status-dot" aria-hidden="true"></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './style.scss';
</style>
