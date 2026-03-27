<template>
  <div class="pagination" v-if="totalPages > 1">
    <button :disabled="modelValue === 1" @click="$emit('update:modelValue', modelValue - 1)">&#8249;</button>
    <span>{{ modelValue }} / {{ totalPages }}</span>
    <button :disabled="modelValue === totalPages" @click="$emit('update:modelValue', modelValue + 1)">&#8250;</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: number; totalPages: number }>();
defineEmits<{ 'update:modelValue': [value: number] }>();
</script>

<style scoped>
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid #edf2f7; }
.pagination button { background: #f7fafc; border: 1px solid #e2e8f0; width: 32px; height: 32px; border-radius: 6px; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.pagination button:disabled { opacity: 0.4; cursor: default; }
.pagination button:not(:disabled):hover { background: #edf2f7; }
.pagination span { font-size: 0.9rem; color: #718096; }
</style>
