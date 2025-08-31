<!-- Home.vue -->
<template>
  <main class="px-4 sm:px-6 lg:px-8 py-8">
    <div class="max-w-4xl mx-auto">
      <SearchBar @search="handleSearch" />
      
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p class="mt-4 text-gray-400">Loading matches...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p class="text-red-400 mb-4">{{ error }}</p>
        <button
          @click="fetchMatches"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Try Again
        </button>
      </div>
      
      <!-- Success state -->
      <div v-else>
        <div v-if="filteredMatches.length === 0" class="text-center py-12">
          <p class="text-gray-400">No matches found for "{{ searchQuery }}"</p>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MatchCard
            v-for="match in paginatedMatches"
            :key="match.id"
            :match="match"
            @track="handleTrack"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center mt-8 space-x-2">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>

          <span class="text-gray-400">
            Page {{ currentPage }} of {{ totalPages }}
          </span>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import SearchBar from '../components/SearchBar.vue';
import MatchCard from '../components/MatchCard.vue';
import { useMatchesStore } from '../store/matches';
import { ref, onMounted, watch } from 'vue';

const {
  matches,
  loading,
  error,
  filteredMatches,
  paginatedMatches,
  currentPage,
  totalPages,
  fetchMatches,
  setSearchQuery,
  addTrackedMatch,
  nextPage,
  prevPage
} = useMatchesStore();

const searchQuery = ref('')

watch(searchQuery, (newVal) => {
  setSearchQuery(newVal)
})

const handleSearch = (query) => {
  searchQuery.value = query
};

const handleTrack = (match) => {
  addTrackedMatch(match);
};

// Fetch matches when component mounts
onMounted(() => {
  fetchMatches();
});
</script>

<style scoped>
/* Add scoped styles if needed */
</style>
