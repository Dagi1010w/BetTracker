<template>
  <div class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col">
    <!-- Header -->
    <header class="px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center gap-4">
        <button
          @click="goBack"
          class="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <!-- Simple arrow symbol -->
          <span class="inline-block mr-2 text-2xl">←</span>

          Back
        </button>
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold">Match Details</h1>
          <div v-if="match" class="flex items-center gap-2">
            <div v-if="match.status === 'LIVE' || match.status === 'IN_PLAY'" class="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <span class="blinking-dot h-2 w-2 bg-white rounded-full"></span>
              LIVE
            </div>
            <div v-else-if="match.status === 'SCHEDULED' || match.status === 'TIMED'" class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              UPCOMING
            </div>
            <div v-else-if="match.status === 'FINISHED'" class="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              FINISHED
            </div>
            <div v-else class="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {{ match.status }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-4xl mx-auto">
        <div v-if="match" class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div class="p-6">
            <!-- League -->
            <div class="text-center mb-6">
              <p class="text-lg font-semibold text-gray-600 dark:text-gray-300">{{ match.league }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ match.date }}</p>
            </div>

            <!-- Teams and Score -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex-1 text-center">
                <img :src="match.team1.logo" :alt="match.team1.name" class="w-16 h-16 mx-auto mb-2 rounded-full" />
                <p class="font-bold text-lg">{{ match.team1.name }}</p>
              </div>
              <div class="flex-shrink-0 text-center px-4">
                <div v-if="match.status === 'LIVE' || match.status === 'IN_PLAY'" class="flex items-center justify-center gap-2 mb-2">
                  <span class="blinking-dot h-3 w-3 bg-emerald-500 rounded-full"></span>
                  <p class="text-sm font-medium text-emerald-500">LIVE</p>
                </div>
                <p v-else-if="match.status === 'SCHEDULED' || match.status === 'TIMED'" class="text-sm font-medium text-blue-500 mb-2">UPCOMING</p>
                <p v-else-if="match.status === 'FINISHED'" class="text-sm font-medium text-gray-500 mb-2">FINISHED</p>
                <p v-else class="text-sm font-medium text-orange-500 mb-2">{{ match.status }}</p>
                <p class="text-4xl font-bold">{{ match.score }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  <span v-if="match.minute !== null && match.status === 'LIVE'">{{ match.minute }}'</span>
                  <span v-else>{{ match.time }}</span>
                </p>
              </div>
              <div class="flex-1 text-center">
                <img :src="match.team2.logo" :alt="match.team2.name" class="w-16 h-16 mx-auto mb-2 rounded-full" />
                <p class="font-bold text-lg">{{ match.team2.name }}</p>
              </div>
            </div>

            <!-- Stats -->
            <div v-if="match.status === 'LIVE' && match.stats" class="border-t pt-6">
              <h3 class="text-lg font-semibold mb-4">Live Stats</h3>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="(val, key) in match.stats" :key="key" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-4 h-5"
                      :class="{ 'bg-yellow-400': key === 'yellow', 'bg-red-600': key === 'red' }"
                    ></div>
                    <span class="capitalize">{{ key }}</span>
                  </div>
                  <span class="font-semibold">{{ val }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Match not found.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMatchesStore } from '../store/matches';

const route = useRoute();
const router = useRouter();

const { trackedMatches, matches } = useMatchesStore();

const match = computed(() => {
  const id = parseInt(route.params.id);
  // First try to find in trackedMatches
  let foundMatch = trackedMatches.value.find(m => m.id === id);
  if (!foundMatch) {
    // If not found, try in all matches
    foundMatch = matches.value.find(m => m.id === id);
  }
  return foundMatch;
});

const goBack = () => {
  router.push('/Tracked');
};
</script>

<style scoped>
@reference "tailwindcss";

body {
  font-family: "Inter", sans-serif;
}

.blinking-dot {
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
