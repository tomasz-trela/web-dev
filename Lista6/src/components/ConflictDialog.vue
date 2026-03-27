<template>
  <Transition name="modal">
    <div v-if="modelValue" class="overlay" @click.self="$emit('close')">
      <div class="dialog">
        <div class="icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3>Nie można usunąć autora</h3>
        <p>Ten autor jest przypisany do {{ books.length === 1 ? 'książki' : 'książek' }}:</p>
        <ul>
          <li v-for="book in books" :key="book">{{ book }}</li>
        </ul>
        <p class="hint">Usuń lub przepisz te książki do innego autora, a następnie spróbuj ponownie.</p>
        <button class="btn-ok" @click="$emit('close')">Rozumiem</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; books: string[] }>();
defineEmits<{ close: [] }>();
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 16px;
}
.dialog {
  background: #fff; border-radius: 16px; padding: 32px 28px 24px;
  width: 100%; max-width: 380px; text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.22);
}
.icon-wrap {
  width: 52px; height: 52px; margin: 0 auto 16px;
  background: #fff7ed; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.icon-wrap svg { width: 26px; height: 26px; color: #f97316; }
h3 { margin: 0 0 8px; font-size: 1.1rem; color: #1a202c; }
p { margin: 0 0 10px; font-size: 0.92rem; color: #718096; }
ul {
  list-style: none; padding: 0; margin: 0 0 12px;
  background: #fff7ed; border-radius: 8px; border: 1px solid #fed7aa;
}
ul li {
  padding: 8px 14px; font-size: 0.9rem; color: #c2410c; font-weight: 500;
  border-bottom: 1px solid #fed7aa;
}
ul li:last-child { border-bottom: none; }
.hint { font-size: 0.82rem; color: #a0aec0; margin-bottom: 20px; }
.btn-ok {
  width: 100%; padding: 10px; border-radius: 8px; border: none;
  background: #f97316; color: #fff; font-size: 0.9rem;
  font-weight: 600; cursor: pointer;
}
.btn-ok:hover { background: #ea6c0a; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.18s; }
.modal-enter-active .dialog, .modal-leave-active .dialog { transition: transform 0.18s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .dialog { transform: scale(0.93) translateY(-8px); }
</style>
