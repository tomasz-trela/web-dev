<template>
  <div class="page" style="max-width: 860px">
    <PageHeader title="Czytelnicy" buttonLabel="+ Dodaj czytelnika" @add="openModal()" />

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th><th>Imię</th><th>Nazwisko</th><th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reader in readers" :key="reader.id!">
            <td class="id-col">{{ reader.id }}</td>
            <td>{{ reader.firstName }}</td>
            <td>{{ reader.lastName }}</td>
            <td class="actions-col">
              <button class="btn-icon btn-edit" @click="openModal(reader)" title="Edytuj">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
              </button>
              <button class="btn-icon btn-delete" @click="deleteReader(reader.id!)" title="Usuń">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-.5 5a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v5a.5.5 0 001 0v-5z" clip-rule="evenodd"/></svg>
              </button>
            </td>
          </tr>
          <tr v-if="readers.length === 0">
            <td colspan="4" class="empty">Brak czytelników w bazie.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination v-model="currentPage" :totalPages="totalPages" />

    <ConfirmDialog
      v-model="showConfirm"
      title="Usuń czytelnika"
      :message="`Czy na pewno chcesz usunąć czytelnika &quot;${pendingDeleteName}&quot;? Wszystkie jego wypożyczenia zostaną usunięte.`"
      confirmLabel="Usuń"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />

    <BaseModal
      v-model="showModal"
      :title="editingReader ? 'Edytuj czytelnika' : 'Nowy czytelnik'"
      :saveLabel="editingReader ? 'Zapisz' : 'Dodaj'"
      @save="saveReader"
    >
      <div class="field">
        <label>Imię</label>
        <input
          v-model="form.firstName"
          placeholder="np. Jan"
          :class="{ 'has-error': submitting && invalidFirstName }"
          @focus="clearStatus"
          @keypress="clearStatus"
        />
      </div>
      <div class="field">
        <label>Nazwisko</label>
        <input
          v-model="form.lastName"
          placeholder="np. Kowalski"
          :class="{ 'has-error': submitting && invalidLastName }"
          @focus="clearStatus"
          @keypress="clearStatus"
        />
      </div>
      <p v-if="error && submitting" class="error-message">Proszę wypełnić wskazane pola formularza</p>
      <p v-if="success" class="success-message">Dane poprawnie zapisano</p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api/client';
import type { Reader, PagedResponse } from '@/types';
import PageHeader from '@/components/PageHeader.vue';
import BaseModal from '@/components/BaseModal.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Pagination from '@/components/Pagination.vue';

const readers = ref<Reader[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 5;
const showModal = ref(false);
const editingReader = ref<Reader | null>(null);
const form = ref<Reader>({ id: null, firstName: '', lastName: '' });
const showConfirm = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteName = ref('');
const submitting = ref(false);
const error = ref(false);
const success = ref(false);

const invalidFirstName = computed(() => form.value.firstName === '');
const invalidLastName = computed(() => form.value.lastName === '');

const clearStatus = () => {
  success.value = false;
  error.value = false;
};

const fetchReaders = async () => {
  try {
    const res = await api.get<PagedResponse<Reader>>(`/readers?page=${currentPage.value - 1}&size=${pageSize}`);
    readers.value = res.content;
    totalPages.value = res.totalPages;
  } catch (e) { console.error(e); }
};

watch(currentPage, fetchReaders);

const openModal = (reader?: Reader) => {
  editingReader.value = reader ?? null;
  form.value = reader ? { ...reader } : { id: null, firstName: '', lastName: '' };
  submitting.value = false;
  error.value = false;
  success.value = false;
  showModal.value = true;
};

const saveReader = async () => {
  submitting.value = true;
  clearStatus();
  if (invalidFirstName.value || invalidLastName.value) {
    error.value = true;
    return;
  }
  try {
    if (editingReader.value && form.value.id != null) {
      await api.put<Reader>(`/readers/${form.value.id}`, form.value);
    } else {
      await api.post<Reader>('/readers', form.value);
    }
    await fetchReaders();
    success.value = true;
    submitting.value = false;
    setTimeout(() => { showModal.value = false; }, 800);
  } catch (e) { console.error(e); }
};

const deleteReader = (id: number) => {
  const reader = readers.value.find(r => r.id === id);
  pendingDeleteId.value = id;
  pendingDeleteName.value = reader ? `${reader.firstName} ${reader.lastName}` : '';
  showConfirm.value = true;
};

const confirmDelete = async () => {
  showConfirm.value = false;
  if (pendingDeleteId.value == null) return;
  try {
    await api.delete(`/readers/${pendingDeleteId.value}`);
    await fetchReaders();
  } catch (e) { console.error(e); }
};

onMounted(fetchReaders);
</script>

<style scoped>
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 0.85rem; font-weight: 600; color: #4a5568; margin-bottom: 6px; }
.field input {
  width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.95rem; outline: none; box-sizing: border-box; transition: border-color 0.2s;
}
.field input:focus { border-color: #42b983; }
.field input.has-error { border-color: #d33c40; }
.error-message { color: #d33c40; font-weight: 500; margin: 0 0 8px; font-size: 0.9rem; }
.success-message { color: #32a95d; font-weight: 500; margin: 0 0 8px; font-size: 0.9rem; }
</style>
