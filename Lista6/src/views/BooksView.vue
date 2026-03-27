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
          <tr v-for="book in books" :key="book.id!">
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
          <tr v-if="books.length === 0">
            <td colspan="5" class="empty">Brak książek w bazie.</td>
          </tr>
        </tbody>
      </table>
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
      :saveDisabled="authors.length === 0"
      maxWidth="460px"
      @save="saveBook"
    >
      <div class="field">
        <label>Tytuł</label>
        <input
          v-model="form.title"
          placeholder="np. Potop"
          :class="{ 'has-error': submitting && invalidTitle }"
          @focus="clearStatus"
          @keypress="clearStatus"
        />
      </div>
      <div class="field">
        <label>Liczba stron</label>
        <input
          v-model.number="form.pages"
          type="number"
          min="1"
          placeholder="np. 936"
          :class="{ 'has-error': submitting && invalidPages }"
          @focus="clearStatus"
          @keypress="clearStatus"
        />
      </div>
      <div class="field">
        <label>Autor</label>
        <select
          v-model="form.authorId"
          :class="{ 'has-error': submitting && invalidAuthorId }"
          @focus="clearStatus"
        >
          <option value="" disabled>Wybierz autora...</option>
          <option v-for="author in authors" :key="author.id!" :value="author.id">
            {{ author.firstName }} {{ author.lastName }}
          </option>
        </select>
        <div v-if="authors.length === 0" class="hint">
          Brak autorów - najpierw dodaj autora w sekcji <router-link to="/authors">Autorzy</router-link>.
        </div>
      </div>
      <p v-if="error && submitting" class="error-message">Proszę wypełnić wskazane pola formularza</p>
      <p v-if="success" class="success-message">Dane poprawnie zapisano</p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/api/client';
import type { Author, Book, BookRequest } from '@/types';
import PageHeader from '@/components/PageHeader.vue';
import BaseModal from '@/components/BaseModal.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const books = ref<Book[]>([]);
const authors = ref<Author[]>([]);
const showModal = ref(false);
const editingBook = ref<Book | null>(null);
const showConfirm = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteTitle = ref('');

const form = ref<{ title: string; pages: number | null; authorId: number | '' }>({
  title: '', pages: null, authorId: '',
});
const submitting = ref(false);
const error = ref(false);
const success = ref(false);

const invalidTitle = computed(() => form.value.title === '');
const invalidPages = computed(() => !form.value.pages || form.value.pages < 1);
const invalidAuthorId = computed(() => form.value.authorId === '');

const clearStatus = () => {
  success.value = false;
  error.value = false;
};

const deleteMessage = computed(() =>
  pendingDeleteTitle.value
    ? `Czy na pewno chcesz usunac "${pendingDeleteTitle.value}"? Tej operacji nie mozna cofnac.`
    : 'Czy na pewno chcesz usunac te ksiazke?'
);


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
  submitting.value = false;
  error.value = false;
  success.value = false;
  showModal.value = true;
};

const saveBook = async () => {
  submitting.value = true;
  clearStatus();
  if (invalidTitle.value || invalidPages.value || invalidAuthorId.value) {
    error.value = true;
    return;
  }
  const payload: BookRequest = {
    title: form.value.title,
    pages: form.value.pages!,
    authorId: form.value.authorId as number,
  };
  try {
    if (editingBook.value && editingBook.value.id != null) {
      await api.put<Book>(`/books/${editingBook.value.id}`, payload);
    } else {
      await api.post<Book>('/books', payload);
    }
    await fetchAll();
    success.value = true;
    submitting.value = false;
    setTimeout(() => { showModal.value = false; }, 800);
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
.field input.has-error, .field select.has-error { border-color: #d33c40; }
.error-message { color: #d33c40; font-weight: 500; margin: 0 0 8px; font-size: 0.9rem; }
.success-message { color: #32a95d; font-weight: 500; margin: 0 0 8px; font-size: 0.9rem; }
.hint { margin-top: 6px; font-size: 0.82rem; color: #a0aec0; }
.hint a { color: #42b983; }
</style>
