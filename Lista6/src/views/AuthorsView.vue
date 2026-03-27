<template>
  <div class="page" style="max-width: 860px">
    <PageHeader title="Autorzy" buttonLabel="+ Dodaj autora" @add="openModal()" />

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th><th>Imię</th><th>Nazwisko</th><th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="author in paginatedAuthors" :key="author.id!">
            <td class="id-col">{{ author.id }}</td>
            <td>{{ author.firstName }}</td>
            <td>{{ author.lastName }}</td>
            <td class="actions-col">
              <button class="btn-icon btn-edit" @click="openModal(author)" title="Edytuj">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
              </button>
              <button class="btn-icon btn-delete" @click="deleteAuthor(author.id!)" title="Usuń">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-.5 5a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v5a.5.5 0 001 0v-5z" clip-rule="evenodd"/></svg>
              </button>
            </td>
          </tr>
          <tr v-if="paginatedAuthors.length === 0">
            <td colspan="4" class="empty">Brak autorów w bazie.</td>
          </tr>
        </tbody>
      </table>
      <Pagination v-model="currentPage" :totalPages="totalPages" />
    </div>

    <ConfirmDialog
      v-model="showConfirm"
      title="Usuń autora"
      :message="deleteMessage"
      confirmLabel="Usuń"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />

    <BaseModal
      v-model="showModal"
      :title="editingAuthor ? 'Edytuj autora' : 'Nowy autor'"
      :saveLabel="editingAuthor ? 'Zapisz' : 'Dodaj'"
      @save="saveAuthor"
    >
      <div class="field">
        <label>Imię</label>
        <input v-model="form.firstName" placeholder="np. Adam" required />
      </div>
      <div class="field">
        <label>Nazwisko</label>
        <input v-model="form.lastName" placeholder="np. Mickiewicz" required />
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/api/client';
import type { Author, Book } from '@/types';
import PageHeader from '@/components/PageHeader.vue';
import Pagination from '@/components/Pagination.vue';
import BaseModal from '@/components/BaseModal.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const authors = ref<Author[]>([]);
const books = ref<Book[]>([]);
const currentPage = ref(1);
const pageSize = 6;
const showModal = ref(false);
const editingAuthor = ref<Author | null>(null);
const form = ref<Author>({ id: null, firstName: '', lastName: '' });
const showConfirm = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteName = ref('');

const authorBooks = computed(() =>
  pendingDeleteId.value != null
    ? books.value.filter(b => b.author?.id === pendingDeleteId.value).map(b => b.title)
    : []
);

const deleteMessage = computed(() => {
  const name = pendingDeleteName.value;
  const count = authorBooks.value.length;
  if (count === 0) return `Czy na pewno chcesz usunac autora "${name}"?`;
  const titles = authorBooks.value.join(', ');
  return `Usuniecie autora "${name}" spowoduje rowniez usuniecie ${count === 1 ? 'ksiazki' : 'ksiazek'}: ${titles}.`;
});

const totalPages = computed(() => Math.max(1, Math.ceil(authors.value.length / pageSize)));
const paginatedAuthors = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return authors.value.slice(start, start + pageSize);
});

const fetchAll = async () => {
  try {
    [authors.value, books.value] = await Promise.all([
      api.get<Author[]>('/authors'),
      api.get<Book[]>('/books'),
    ]);
  } catch (e) { console.error(e); }
};

const openModal = (author?: Author) => {
  editingAuthor.value = author ?? null;
  form.value = author ? { ...author } : { id: null, firstName: '', lastName: '' };
  showModal.value = true;
};

const saveAuthor = async () => {
  try {
    if (editingAuthor.value && form.value.id != null) {
      await api.put<Author>(`/authors/${form.value.id}`, form.value);
    } else {
      await api.post<Author>('/authors', form.value);
    }
    await fetchAll();
    showModal.value = false;
  } catch (e) { console.error(e); }
};

const deleteAuthor = (id: number) => {
  const author = authors.value.find(a => a.id === id);
  pendingDeleteId.value = id;
  pendingDeleteName.value = author ? `${author.firstName} ${author.lastName}` : '';
  showConfirm.value = true;
};

const confirmDelete = async () => {
  showConfirm.value = false;
  if (pendingDeleteId.value == null) return;
  try {
    await api.delete(`/authors/${pendingDeleteId.value}`);
    if (paginatedAuthors.value.length === 1 && currentPage.value > 1) currentPage.value--;
    await fetchAll();
  } catch (e) { console.error(e); }
};

onMounted(fetchAll);
</script>

<style scoped>
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 0.85rem; font-weight: 600; color: #4a5568; margin-bottom: 6px; }
.field input {
  width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.95rem; outline: none; box-sizing: border-box; transition: border-color 0.2s;
}
.field input:focus { border-color: #42b983; }
</style>
