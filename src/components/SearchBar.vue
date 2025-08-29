<!-- SearchBar.vue -->
<template>
  <div class="mb-8">
    <label class="relative flex items-center">
      <div class="absolute left-4 text-gray-400">
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
        </svg>
      </div>
      <input
        class="form-input w-full rounded-xl bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-14 pl-12 pr-4 text-base focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
        placeholder="Search for a football team or match..."
        v-model="searchQuery"
        @input="$emit('search', searchQuery)"
      />
    </label>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const searchQuery = ref('');

// Emit search event on input
const emit = defineEmits(['search']);
</script>