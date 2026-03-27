<template>
  <div class="page-header">
    <h2>{{ title }}</h2>
    <button class="btn-add" @click="$emit('add')">{{ buttonLabel }}</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; buttonLabel: string }>();
defineEmits<{ add: [] }>();
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 1.6rem; color: #1a202c; }
.btn-add {
  background: #42b983; color: #fff; border: none; padding: 9px 20px;
  border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer;
  transition: background 0.2s;
}
.btn-add:hover { background: #36a372; }
</style>
