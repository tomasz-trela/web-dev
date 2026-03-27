<template>
  <div class="main-layout">
    <header>
      <div class="header-inner">
        <router-link to="/" class="logo">
          <span class="logo-icon">📚</span>
          <span class="logo-text">Biblioteka</span>
        </router-link>
        <nav>
          <router-link to="/books">Książki</router-link>
          <router-link to="/authors">Autorzy</router-link>
        </nav>
      </div>
    </header>
    <main>
      <slot />
    </main>
    <footer>
      <small>Biblioteka &copy; 2026 &mdash; Vue 3 + Spring Boot</small>
    </footer>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.main-layout { min-height: 100vh; display: flex; flex-direction: column; background: #f0f4f8; }

header {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  position: sticky; top: 0; z-index: 100;
}
.header-inner {
  max-width: 1100px; margin: 0 auto; padding: 0 24px;
  height: 60px; display: flex; align-items: center; justify-content: space-between;
}
.logo {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none; color: #1a202c;
}
.logo-icon { font-size: 1.4rem; }
.logo-text { font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; }

nav { display: flex; gap: 4px; }
nav a {
  color: #4a5568; text-decoration: none; font-weight: 500; font-size: 0.9rem;
  padding: 6px 14px; border-radius: 8px; transition: background 0.15s, color 0.15s;
}
nav a:hover { background: #f7fafc; color: #1a202c; }
nav a.router-link-active { background: #ebf8f2; color: #2d9c6e; }

main { flex: 1; padding: 32px 24px; max-width: 1100px; width: 100%; margin: 0 auto; box-sizing: border-box; }

footer { text-align: center; padding: 16px; color: #a0aec0; font-size: 0.82rem; border-top: 1px solid #e2e8f0; background: #fff; }
</style>
