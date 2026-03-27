<template>
  <Transition name="modal">
    <div v-if="modelValue" class="overlay" @click.self="$emit('cancel')">
      <div class="dialog" role="alertdialog" aria-modal="true">
        <div class="icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="actions">
          <button class="btn-cancel" @click="$emit('cancel')">Anuluj</button>
          <button class="btn-confirm" @click="$emit('confirm')">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
}>();
defineEmits<{ confirm: []; cancel: [] }>();
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 16px;
}
.dialog {
  background: #fff; border-radius: 16px; padding: 32px 28px 24px;
  width: 100%; max-width: 360px; text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.22);
}
.icon-wrap {
  width: 52px; height: 52px; margin: 0 auto 16px;
  background: #fff5f5; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.icon-wrap svg { width: 26px; height: 26px; color: #ef4444; }
h3 { margin: 0 0 8px; font-size: 1.1rem; color: #1a202c; }
p { margin: 0 0 24px; font-size: 0.92rem; color: #718096; line-height: 1.5; }
.actions { display: flex; gap: 10px; }
.btn-cancel {
  flex: 1; padding: 10px; border-radius: 8px; border: 1.5px solid #e2e8f0;
  background: #f7fafc; font-size: 0.9rem; cursor: pointer; font-weight: 500;
}
.btn-cancel:hover { background: #edf2f7; }
.btn-confirm {
  flex: 1; padding: 10px; border-radius: 8px; border: none;
  background: #ef4444; color: #fff; font-size: 0.9rem; cursor: pointer; font-weight: 600;
}
.btn-confirm:hover { background: #dc2626; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.18s; }
.modal-enter-active .dialog, .modal-leave-active .dialog { transition: transform 0.18s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .dialog { transform: scale(0.93) translateY(-8px); }
</style>
