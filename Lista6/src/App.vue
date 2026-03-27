<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';

const route = useRoute();
const layout = computed(() => route.meta.layout || MainLayout);
</script>

<style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #f0f4f8; color: #2d3748; }
</style>