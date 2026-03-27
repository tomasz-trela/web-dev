<template>
  <div class="page">
    <div class="page-header">
      <h2>Książki</h2>
      <button class="btn-add" @click="openModal()">+ Dodaj książkę</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tytuł</th>
            <th>Autor</th>
            <th>Strony</th>
            <th>Akcje</th>
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

      <div class="pagination" v-if="totalPages > 1">
        <button :disabled="currentPage === 1" @click="currentPage--">&#8249;</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="currentPage++">&#8250;</button>
      </div>
    </div>

    <!-- Confirm delete -->
    <ConfirmDialog
      v-model="showConfirm"
      title="Usuń książkę"
      :message="deleteMessage"
      confirmLabel="Usuń"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editingBook ? 'Edytuj książkę' : 'Nowa książka' }}</h3>
            <button class="modal-close" @click="closeModal">&#x2715;</button>
          </div>
          <form @submit.prevent="saveBook" class="modal-body">
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
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="closeModal">Anuluj</button>
              <button type="submit" class="btn-save" :disabled="!form.authorId">
                {{ editingBook ? 'Zapisz' : 'Dodaj' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/api/client';
import type { Author, Book, BookRequest } from '@/types';
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
  title: '',
  pages: null,
  authorId: '',
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

const closeModal = () => { showModal.value = false; };

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
    closeModal();
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
.page { max-width: 960px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 1.6rem; color: #1a202c; }

.btn-add {
  background: #42b983; color: #fff; border: none; padding: 9px 20px;
  border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer;
  transition: background 0.2s;
}
.btn-add:hover { background: #36a372; }

.card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; }

.table { width: 100%; border-collapse: collapse; }
.table th { background: #f7fafc; color: #4a5568; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; text-align: left; border-bottom: 2px solid #edf2f7; }
.table td { padding: 14px 16px; border-bottom: 1px solid #edf2f7; color: #2d3748; font-size: 0.95rem; }
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover { background: #f7fafc; }
.id-col { color: #a0aec0; font-weight: 600; width: 60px; }
.title-col { font-weight: 500; }
.pages-col { color: #718096; width: 90px; }
.actions-col { width: 100px; text-align: right; }
.empty { text-align: center; color: #a0aec0; padding: 32px; }

.btn-icon {
  border: none; background: none; cursor: pointer; padding: 6px;
  border-radius: 6px; display: inline-flex; transition: background 0.15s;
}
.btn-icon svg { width: 17px; height: 17px; }
.btn-edit { color: #3b82f6; }
.btn-edit:hover { background: #eff6ff; }
.btn-delete { color: #ef4444; }
.btn-delete:hover { background: #fef2f2; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid #edf2f7; }
.pagination button { background: #f7fafc; border: 1px solid #e2e8f0; width: 32px; height: 32px; border-radius: 6px; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.pagination button:disabled { opacity: 0.4; cursor: default; }
.pagination button:not(:disabled):hover { background: #edf2f7; }
.pagination span { font-size: 0.9rem; color: #718096; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
}
.modal {
  background: #fff; border-radius: 14px; width: 100%; max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0;
}
.modal-header h3 { margin: 0; font-size: 1.2rem; color: #1a202c; }
.modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #a0aec0; padding: 4px; line-height: 1; }
.modal-close:hover { color: #4a5568; }
.modal-body { padding: 20px 24px; }
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
