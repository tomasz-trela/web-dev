<template>
  <div class="page" style="max-width: 960px">
    <PageHeader title="Wypożyczalnia" buttonLabel="+ Wypożycz książkę" @add="openModal()" />

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th><th>Książka</th><th>Czytelnik</th><th>Data wypożyczenia</th><th>Termin zwrotu</th><th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rental in rentals" :key="rental.id!">
            <td class="id-col">{{ rental.id }}</td>
            <td class="title-col">{{ rental.book.title }}</td>
            <td>{{ rental.reader.firstName }} {{ rental.reader.lastName }}</td>
            <td>{{ rental.rentalDate }}</td>
            <td>{{ rental.rentalDue }}</td>
            <td class="actions-col">
              <button class="btn-icon btn-delete" @click="returnRental(rental)" title="Zwróć">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd"/></svg>
              </button>
            </td>
          </tr>
          <tr v-if="rentals.length === 0">
            <td colspan="6" class="empty">Brak wypożyczeń w bazie.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination v-model="currentPage" :totalPages="totalPages" />

    <ConfirmDialog
      v-model="showConfirm"
      title="Zwróć książkę"
      :message="`Czy na pewno chcesz zwrócić książkę &quot;${pendingReturnTitle}&quot;?`"
      confirmLabel="Zwróć"
      @confirm="confirmReturn"
      @cancel="showConfirm = false"
    />

    <BaseModal
      v-model="showModal"
      title="Nowe wypożyczenie"
      saveLabel="Wypożycz"
      :saveDisabled="books.length === 0 || readers.length === 0"
      maxWidth="460px"
      @save="rentBook"
    >
      <div class="field">
        <label>Książka</label>
        <div class="autocomplete" ref="bookDropdownRef">
          <input
            v-model="bookSearch"
            :class="{ 'has-error': submitting && invalidBookId }"
            placeholder="Wpisz tytuł książki..."
            @focus="bookDropdownOpen = true; clearStatus()"
            @input="bookDropdownOpen = true"
          />
          <ul v-if="bookDropdownOpen && filteredBooks.length > 0" class="autocomplete__list">
            <li
              v-for="book in filteredBooks"
              :key="book.id!"
              class="autocomplete__option"
              :class="{ selected: form.bookId === book.id }"
              @mousedown.prevent="selectBook(book)"
            >
              {{ book.title }} — {{ book.author.firstName }} {{ book.author.lastName }}
            </li>
          </ul>
        </div>
        <div v-if="books.length === 0" class="hint">
          Brak książek - najpierw dodaj książkę w sekcji <router-link to="/books">Książki</router-link>.
        </div>
      </div>
      <div class="field">
        <label>Czytelnik</label>
        <div class="autocomplete" ref="readerDropdownRef">
          <input
            v-model="readerSearch"
            :class="{ 'has-error': submitting && invalidReaderId }"
            placeholder="Wpisz imię lub nazwisko czytelnika..."
            @focus="readerDropdownOpen = true; clearStatus()"
            @input="readerDropdownOpen = true"
          />
          <ul v-if="readerDropdownOpen && filteredReaders.length > 0" class="autocomplete__list">
            <li
              v-for="reader in filteredReaders"
              :key="reader.id!"
              class="autocomplete__option"
              :class="{ selected: form.readerId === reader.id }"
              @mousedown.prevent="selectReader(reader)"
            >
              {{ reader.firstName }} {{ reader.lastName }}
            </li>
          </ul>
        </div>
        <div v-if="readers.length === 0" class="hint">
          Brak czytelników - najpierw dodaj czytelnika w sekcji <router-link to="/readers">Czytelnicy</router-link>.
        </div>
      </div>
      <p v-if="error && submitting" class="error-message">Proszę wybrać książkę i czytelnika</p>
      <p v-if="success" class="success-message">Wypożyczenie zapisano pomyślnie</p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import api from '@/api/client';
import type { Book, Reader, Rental, PagedResponse } from '@/types';
import PageHeader from '@/components/PageHeader.vue';
import BaseModal from '@/components/BaseModal.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Pagination from '@/components/Pagination.vue';

const rentals = ref<Rental[]>([]);
const books = ref<Book[]>([]);
const readers = ref<Reader[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 5;
const showModal = ref(false);
const showConfirm = ref(false);
const pendingReturnId = ref<number | null>(null);
const pendingReturnTitle = ref('');

const form = ref<{ bookId: number | ''; readerId: number | '' }>({
  bookId: '', readerId: '',
});
const submitting = ref(false);
const error = ref(false);
const success = ref(false);

const invalidBookId = computed(() => form.value.bookId === '');
const invalidReaderId = computed(() => form.value.readerId === '');

const clearStatus = () => {
  success.value = false;
  error.value = false;
};

// Book autocomplete
const bookDropdownOpen = ref(false);
const bookSearch = ref('');
const bookDropdownRef = ref<HTMLElement | null>(null);

const filteredBooks = computed(() => {
  const q = bookSearch.value.toLowerCase().trim();
  if (!q) return books.value;
  return books.value.filter(b => b.title.toLowerCase().includes(q));
});

const selectBook = (book: Book) => {
  form.value.bookId = book.id!;
  bookSearch.value = book.title;
  bookDropdownOpen.value = false;
};

// Reader autocomplete
const readerDropdownOpen = ref(false);
const readerSearch = ref('');
const readerDropdownRef = ref<HTMLElement | null>(null);

const filteredReaders = computed(() => {
  const q = readerSearch.value.toLowerCase().trim();
  if (!q) return readers.value;
  return readers.value.filter(r =>
    `${r.firstName} ${r.lastName}`.toLowerCase().includes(q)
  );
});

const selectReader = (reader: Reader) => {
  form.value.readerId = reader.id!;
  readerSearch.value = `${reader.firstName} ${reader.lastName}`;
  readerDropdownOpen.value = false;
};

const onClickOutside = (e: MouseEvent) => {
  if (bookDropdownRef.value && !bookDropdownRef.value.contains(e.target as Node)) {
    bookDropdownOpen.value = false;
    const selected = books.value.find(b => b.id === form.value.bookId);
    bookSearch.value = selected ? selected.title : '';
  }
  if (readerDropdownRef.value && !readerDropdownRef.value.contains(e.target as Node)) {
    readerDropdownOpen.value = false;
    const selected = readers.value.find(r => r.id === form.value.readerId);
    readerSearch.value = selected ? `${selected.firstName} ${selected.lastName}` : '';
  }
};

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));

const fetchRentals = async () => {
  try {
    const res = await api.get<PagedResponse<Rental>>(`/rentals?page=${currentPage.value - 1}&size=${pageSize}`);
    rentals.value = res.content;
    totalPages.value = res.totalPages;
    if (rentals.value.length === 0 && currentPage.value > 1) {
      currentPage.value = totalPages.value || 1;
      return;
    }
  } catch (e) { console.error(e); }
};

const fetchLists = async () => {
  try {
    const [booksRes, readersRes] = await Promise.all([
      api.get<PagedResponse<Book>>('/books?page=0&size=1000'),
      api.get<PagedResponse<Reader>>('/readers?page=0&size=1000'),
    ]);
    books.value = booksRes.content;
    readers.value = readersRes.content;
  } catch (e) { console.error(e); }
};

const fetchAll = async () => {
  await Promise.all([fetchRentals(), fetchLists()]);
};

watch(currentPage, fetchRentals);

const openModal = () => {
  form.value = { bookId: '', readerId: '' };
  bookSearch.value = '';
  readerSearch.value = '';
  bookDropdownOpen.value = false;
  readerDropdownOpen.value = false;
  submitting.value = false;
  error.value = false;
  success.value = false;
  showModal.value = true;
};

const rentBook = async () => {
  submitting.value = true;
  clearStatus();
  if (invalidBookId.value || invalidReaderId.value) {
    error.value = true;
    return;
  }
  try {
    await api.post<Rental>(`/rentals/rent?bookId=${form.value.bookId}&readerId=${form.value.readerId}`, {});
    await fetchAll();
    success.value = true;
    submitting.value = false;
    setTimeout(() => { showModal.value = false; }, 800);
  } catch (e) { console.error(e); }
};

const returnRental = (rental: Rental) => {
  pendingReturnId.value = rental.id!;
  pendingReturnTitle.value = rental.book.title;
  showConfirm.value = true;
};

const confirmReturn = async () => {
  showConfirm.value = false;
  if (pendingReturnId.value == null) return;
  try {
    await api.delete(`/rentals/return/${pendingReturnId.value}`);
    await fetchRentals();
  } catch (e) { console.error(e); }
};

onMounted(fetchAll);
</script>

<style scoped>
.title-col { font-weight: 500; }

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

/* Autocomplete */
.autocomplete { position: relative; }
.autocomplete__list {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 50;
  list-style: none; margin: 2px 0 0; padding: 4px 0;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); max-height: 180px; overflow-y: auto;
}
.autocomplete__option {
  padding: 8px 12px; cursor: pointer; font-size: 0.93rem; color: #2d3748;
  transition: background 0.15s;
}
.autocomplete__option:hover { background: #f0fff4; }
.autocomplete__option.selected { background: #e6fffa; color: #42b983; font-weight: 600; }
</style>
