import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import BooksView from '../views/BooksView.vue';
import AuthorsView from '../views/AuthorsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/books', name: 'books', component: BooksView },
    { path: '/authors', name: 'authors', component: AuthorsView },
  ]
});

export default router;