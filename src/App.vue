<!-- App.vue -->
<template>
  <div class="bg-gray-900 text-white min-h-screen">
    <NavBar />
    <router-view />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue';
</script>

<style>
:root {
  --primary-color: #059669;
  --secondary-color: #3b82f6;
}
body {
  font-family: 'Inter', sans-serif;
}
</style>