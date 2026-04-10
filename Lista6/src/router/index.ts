import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import BooksView from '../views/BooksView.vue';
import AuthorsView from '../views/AuthorsView.vue';
import ReadersView from '../views/ReadersView.vue';
import RentalsView from '../views/RentalsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/books', name: 'books', component: BooksView },
    { path: '/authors', name: 'authors', component: AuthorsView },
    { path: '/readers', name: 'readers', component: ReadersView },
    { path: '/rentals', name: 'rentals', component: RentalsView },
  ]
});

export default router;