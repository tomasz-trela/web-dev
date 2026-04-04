<template>
  <div class="home">
    <div class="hero">
      <h1>Panel Biblioteki</h1>
      <p>Zarządzaj księgozbiorem i autorami w prosty sposób.</p>
    </div>

    <div class="cards">
      <router-link to="/books" class="card">
        <div class="card-content">
          <h3>Książki</h3>
          <p>Przeglądaj, dodawaj, edytuj i usuwaj pozycje z księgozbioru.</p>
        </div>
        <span class="card-arrow">&#8594;</span>
      </router-link>

      <router-link to="/authors" class="card">
        <div class="card-content">
          <h3>Autorzy</h3>
          <p>Zarządzaj bazą autorów dostępnych w systemie.</p>
        </div>
        <span class="card-arrow">&#8594;</span>
      </router-link>

      <router-link to="/readers" class="card">
        <div class="card-content">
          <h3>Czytelnicy</h3>
          <p>Przeglądaj i zarządzaj czytelnikami biblioteki.</p>
        </div>
        <span class="card-arrow">&#8594;</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.home { max-width: 700px; margin: 0 auto; }

.hero { text-align: center; padding: 40px 0 48px; }
.hero h1 { margin: 0 0 10px; font-size: 2rem; color: #1a202c; font-weight: 800; }
.hero p { margin: 0; color: #718096; font-size: 1.05rem; }

.cards { display: flex; flex-direction: column; gap: 16px; }
.card {
  display: flex; align-items: center; gap: 20px;
  background: #fff; border-radius: 14px; padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  text-decoration: none; color: inherit;
  border: 1.5px solid transparent;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}
.card:hover {
  border-color: #42b983;
  box-shadow: 0 6px 24px rgba(66,185,131,0.15);
  transform: translateY(-2px);
}
.card-icon { font-size: 2.2rem; flex-shrink: 0; }
.card-content { flex: 1; }
.card-content h3 { margin: 0 0 6px; font-size: 1.1rem; color: #1a202c; }
.card-content p { margin: 0; color: #718096; font-size: 0.9rem; line-height: 1.5; }
.card-arrow { color: #42b983; font-size: 1.4rem; flex-shrink: 0; }
</style>
