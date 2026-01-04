<script setup lang="ts"></script>

<template>
  <div class="index">
    <h1 v-for="item in 50" :key="item">home{{ item }}</h1>
  </div>
</template>

<style scoped lang="scss"></style>
