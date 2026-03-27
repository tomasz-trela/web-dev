<template>
  <div class="page" style="max-width: 960px">
    <PageHeader title="Książki" buttonLabel="+ Dodaj książkę" @add="openModal()" />

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th><th>Tytuł</th><th>Autor</th><th>Strony</th><th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in paginatedBooks" :key="book.id!">
            <td class="id-col">{{ book.id }}</td>
            <td class="title-col">{{ book.title }}</td>
            <td>{{ book.author.firstName }} {{ book.author.lastName }}</td>
            <td class="pages-col">{{ book.pages }}</td>
            <td class="actions-col">
              <button class="btn-icon btn-edit" @click="openModal(book)" title="Edytuj">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
              </button>
              <button class="btn-icon btn-delete" @click="deleteBook(book.id!)" title="Usuń">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-.5 5a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v5a.5.5 0 001 0v-5z" clip-rule="evenodd"/></svg>
              </button>
            </td>
          </tr>
          <tr v-if="paginatedBooks.length === 0">
            <td colspan="5" class="empty">Brak książek w bazie.</td>
          </tr>
        </tbody>
      </table>
      <Pagination v-model="currentPage" :totalPages="totalPages" />
    </div>

    <ConfirmDialog
      v-model="showConfirm"
      title="Usuń książkę"
      :message="deleteMessage"
      confirmLabel="Usuń"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />

    <BaseModal
      v-model="showModal"
      :title="editingBook ? 'Edytuj książkę' : 'Nowa książka'"
      :saveLabel="editingBook ? 'Zapisz' : 'Dodaj'"
      :saveDisabled="!form.authorId"
      maxWidth="460px"
      @save="saveBook"
    >
      <div class="field">
        <label>Tytuł</label>
        <input v-model="form.title" placeholder="np. Potop" required />
      </div>
      <div class="field">
        <label>Liczba stron</label>
        <input v-model.number="form.pages" type="number" min="1" placeholder="np. 936" required />
      </div>
      <div class="field">
        <label>Autor</label>
        <select v-model="form.authorId" required>
          <option value="" disabled>Wybierz autora...</option>
          <option v-for="author in authors" :key="author.id!" :value="author.id">
            {{ author.firstName }} {{ author.lastName }}
          </option>
        </select>
        <div v-if="authors.length === 0" class="hint">
          Brak autorów &mdash; najpierw dodaj autora w sekcji <router-link to="/authors">Autorzy</router-link>.
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/api/client';
import type { Author, Book, BookRequest } from '@/types';
import PageHeader from '@/components/PageHeader.vue';
import Pagination from '@/components/Pagination.vue';
import BaseModal from '@/components/BaseModal.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const books = ref<Book[]>([]);
const authors = ref<Author[]>([]);
const currentPage = ref(1);
const pageSize = 5;
const showModal = ref(false);
const editingBook = ref<Book | null>(null);
const showConfirm = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteTitle = ref('');

const form = ref<{ title: string; pages: number | null; authorId: number | '' }>({
  title: '', pages: null, authorId: '',
});

const deleteMessage = computed(() =>
  pendingDeleteTitle.value
    ? `Czy na pewno chcesz usunac "${pendingDeleteTitle.value}"? Tej operacji nie mozna cofnac.`
    : 'Czy na pewno chcesz usunac te ksiazke?'
);

const totalPages = computed(() => Math.max(1, Math.ceil(books.value.length / pageSize)));
const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return books.value.slice(start, start + pageSize);
});

const fetchAll = async () => {
  try {
    [books.value, authors.value] = await Promise.all([
      api.get<Book[]>('/books'),
      api.get<Author[]>('/authors'),
    ]);
  } catch (e) { console.error(e); }
};

const openModal = (book?: Book) => {
  editingBook.value = book ?? null;
  form.value = {
    title: book?.title ?? '',
    pages: book?.pages ?? null,
    authorId: book?.author?.id ?? '',
  };
  showModal.value = true;
};

const saveBook = async () => {
  if (!form.value.authorId || !form.value.pages) return;
  const payload: BookRequest = {
    title: form.value.title,
    pages: form.value.pages,
    authorId: form.value.authorId as number,
  };
  try {
    if (editingBook.value && editingBook.value.id != null) {
      await api.put<Book>(`/books/${editingBook.value.id}`, payload);
    } else {
      await api.post<Book>('/books', payload);
    }
    await fetchAll();
    showModal.value = false;
  } catch (e) { console.error(e); }
};

const deleteBook = (id: number) => {
  const book = books.value.find(b => b.id === id);
  pendingDeleteId.value = id;
  pendingDeleteTitle.value = book?.title ?? '';
  showConfirm.value = true;
};

const confirmDelete = async () => {
  showConfirm.value = false;
  if (pendingDeleteId.value == null) return;
  try {
    await api.delete(`/books/${pendingDeleteId.value}`);
    if (paginatedBooks.value.length === 1 && currentPage.value > 1) currentPage.value--;
    await fetchAll();
  } catch (e) { console.error(e); }
};

onMounted(fetchAll);
</script>

<style scoped>
.title-col { font-weight: 500; }
.pages-col { color: #718096; width: 90px; }

.field { margin-bottom: 16px; }
.field label { display: block; font-size: 0.85rem; font-weight: 600; color: #4a5568; margin-bottom: 6px; }
.field input, .field select {
  width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.95rem; outline: none; box-sizing: border-box; transition: border-color 0.2s;
  background: #fff; color: #2d3748;
}
.field input:focus, .field select:focus { border-color: #42b983; }
.hint { margin-top: 6px; font-size: 0.82rem; color: #a0aec0; }
.hint a { color: #42b983; }
</style>
