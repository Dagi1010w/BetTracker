<!-- NavBar.vue -->
<template>
  <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
    <div class="flex items-center gap-3 text-white">
      <div class="size-8 text-[var(--primary-color)]">
        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"></path>
        </svg>
      </div>
      <h1 class="text-xl font-bold tracking-tight">BetTracker</h1>
    </div>
    <router-link to="/Tracked" class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[var(--primary-color)] hover:bg-emerald-700 text-white text-sm font-semibold leading-normal shadow-md transition-colors gap-2">
      <span class="truncate">Tracked Matches</span>
      <span class="flex items-center justify-center rounded-full bg-white text-[var(--primary-color)] text-xs font-bold size-6">{{ trackedCount }}</span>
    </router-link>
  </header>
</template>

<script setup>
import { useMatchesStore } from '../store/matches';

const { trackedCount } = useMatchesStore();
</script>

<style scoped>
/* Add scoped styles if needed */
</style>