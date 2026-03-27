<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal" :style="maxWidth ? { maxWidth } : {}">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button type="button" class="modal-close" @click="$emit('update:modelValue', false)">&#x2715;</button>
        </div>
        <form @submit.prevent="$emit('save')" class="modal-body">
          <slot />
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="$emit('update:modelValue', false)">Anuluj</button>
            <button type="submit" class="btn-save" :disabled="saveDisabled">{{ saveLabel }}</button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean;
  title: string;
  saveLabel?: string;
  saveDisabled?: boolean;
  maxWidth?: string;
}>(), {
  saveLabel: 'Zapisz',
  saveDisabled: false,
});

defineEmits<{
  'update:modelValue': [value: boolean];
  save: [];
}>();
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}
.modal {
  background: #fff; border-radius: 14px; width: 100%; max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
.modal-header h3 { margin: 0; font-size: 1.2rem; color: #1a202c; }
.modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #a0aec0; padding: 4px; line-height: 1; }
.modal-close:hover { color: #4a5568; }
.modal-body { padding: 20px 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-cancel { background: #f7fafc; border: 1.5px solid #e2e8f0; padding: 9px 18px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
.btn-cancel:hover { background: #edf2f7; }
.btn-save { background: #42b983; color: #fff; border: none; padding: 9px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
.btn-save:hover:not(:disabled) { background: #36a372; }
.btn-save:disabled { opacity: 0.5; cursor: default; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal { transform: scale(0.95) translateY(-10px); }
</style>
