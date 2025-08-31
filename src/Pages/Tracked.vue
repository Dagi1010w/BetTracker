<template>
  <div class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col">
    

    <!-- Main -->
    <main class="flex-1 px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header row -->
        <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div class="flex items-center gap-4">
            <h2 class="text-2xl font-bold tracking-tight">My Tracked Matches</h2>
            <span
              class="bg-emerald-500 text-white text-sm font-semibold px-3 py-1 rounded-full"
            >
              {{ matches.length }}
            </span>
          </div>
          <button
            @click="refreshMatches"
            class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <span class="material-icons">refresh</span>
            Refresh
          </button>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(match, i) in matches"
            :key="i"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-2 cursor-pointer"
            :class="{
              'border-emerald-500': match.status === 'LIVE',
              'opacity-70': match.status === 'FINISHED'
            }"
            @click="goToMatchDetail(match)"
          >
            <div class="p-5">
              <div class="flex justify-between items-start">
                <div>
                  <!-- Status -->
                  <div v-if="match.status === 'LIVE' || match.status === 'IN_PLAY'" class="flex items-center gap-2 mb-2">
                    <span class="blinking-dot h-2 w-2 bg-emerald-500 rounded-full"></span>
                    <p class="text-sm font-medium text-emerald-500">LIVE</p>
                  </div>
                  <p
                    v-else-if="match.status === 'SCHEDULED' || match.status === 'TIMED'"
                    class="text-sm font-medium text-blue-500 mb-2"
                  >
                    UPCOMING
                  </p>
                  <p
                    v-else-if="match.status === 'FINISHED'"
                    class="text-sm font-medium text-gray-500 mb-2"
                  >
                    FINISHED
                  </p>
                  <p
                    v-else
                    class="text-sm font-medium text-orange-500 mb-2"
                  >
                    {{ match.status }}
                  </p>

                  <!-- Teams -->
                  <p class="font-bold text-lg leading-tight mb-2">{{ match.title }}</p>

                  <!-- Info -->
                  <p class="text-gray-500 dark:text-gray-300 text-sm">
                    <span v-if="match.status === 'LIVE' || match.status === 'IN_PLAY'">
                      <span v-if="match.minute !== null">{{ match.minute }}' </span>
                      <span v-else>{{ match.time }} </span>
                    </span>
                    <span
                      v-if="match.status === 'FINISHED'"
                      class="font-semibold"
                      >Final</span
                    >
                    <span
                      v-if="match.status === 'LIVE' || match.status === 'IN_PLAY' || match.status === 'FINISHED'"
                      class="font-semibold text-lg text-gray-800 dark:text-white ml-1"
                    >
                      {{ match.score }}
                    </span>
                    <span v-if="match.status === 'SCHEDULED' || match.status === 'TIMED'">{{ match.time }}</span>
                  </p>
                </div>

                <!-- Delete -->
                <button
                  @click.stop="removeMatch(i)"
                  class="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  <span class="material-icons">delete</span>
                </button>
              </div>

              <!-- Extra stats -->
              <div
                v-if="match.status === 'LIVE' && match.stats"
                class="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400"
              >
                <div v-for="(val, key) in match.stats" :key="key" class="flex items-center gap-1">
                  <div
                    class="w-3 h-4"
                    :class="{ 'bg-yellow-400': key === 'yellow', 'bg-red-600': key === 'red' }"
                  ></div>
                  <span>{{ val }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Toast -->
    <div
      v-show="toastVisible"
      class="fixed bottom-5 right-5 flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow dark:text-gray-400 dark:divide-gray-700 dark:bg-gray-800 transition-opacity duration-300"
      role="alert"
    >
      <div class="text-green-500">
        <span class="material-icons">check_circle</span>
      </div>
      <div class="pl-4 text-sm font-normal">{{ toastMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router';
import { useMatchesStore } from '../store/matches';

const router = useRouter();

const { trackedMatches, removeTrackedMatch, startLiveUpdates, stopLiveUpdates, fetchMatches } = useMatchesStore();

const darkMode = ref(false);
const toastVisible = ref(false);
const toastMessage = ref("");

// Use tracked matches from store
const matches = trackedMatches;

// Toggle dark mode
const toggleTheme = () => {
  darkMode.value = !darkMode.value;
  document.body.classList.toggle("dark", darkMode.value);
};

// Remove match
const removeMatch = (index) => {
  removeTrackedMatch(index);
  showToast("Match removed.");
};

// Toast function
const showToast = (msg) => {
  toastMessage.value = msg;
  toastVisible.value = true;
  setTimeout(() => {
    toastVisible.value = false;
  }, 3000);
};

// Refresh matches manually
const refreshMatches = async () => {
  await fetchMatches();
  showToast("Matches refreshed.");
};

// Start live updates when component is mounted
onMounted(() => {
  startLiveUpdates();
});

// Go to match detail
const goToMatchDetail = (match) => {
  router.push(`/matches/${match.id}`);
};

// Stop live updates when component is unmounted
onUnmounted(() => {
  stopLiveUpdates();
});
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
