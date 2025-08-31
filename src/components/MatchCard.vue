<!-- MatchCard.vue -->
<template>
  <div
    class="bg-gray-900 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300"
  >
    <!-- League Banner -->
    <div :class="getLeagueGradient(match.league)" class="px-5 py-2 text-center">
      <span class="text-white font-semibold text-sm tracking-wide">
        {{ match.league }}
      </span>
    </div>

    <div class="p-5">
      <!-- Teams -->
      <div class="flex items-center justify-between mb-5">
        <!-- Team 1 -->
        <div class="flex flex-col items-center flex-1">
          <img
            :src="fixLogo(match.team1.logo)"
            :alt="match.team1.name"
            class="w-14 h-14 object-contain bg-white p-1 rounded-full shadow-md"
          />
          <h3 class="mt-2 font-semibold text-white text-base text-center">
            {{ match.team1.name }}
          </h3>
        </div>

        <!-- Score/Time -->
        <div class="mx-3 flex flex-col items-center">
          <div v-if="match.status === 'LIVE' || match.status === 'IN_PLAY' || match.status === 'FINISHED'" class="text-2xl font-bold text-white">
            {{ match.score }}
          </div>
          <div v-else class="text-lg font-semibold text-gray-300">
            {{ match.time }}
          </div>
          <div v-if="match.status === 'LIVE' || match.status === 'IN_PLAY'" class="text-xs text-red-400 font-semibold mt-1">
            LIVE
          </div>
          <div v-else-if="match.status === 'FINISHED'" class="text-xs text-gray-400 font-semibold mt-1">
            FT
          </div>
        </div>

        <!-- Team 2 -->
        <div class="flex flex-col items-center flex-1">
          <img
            :src="fixLogo(match.team2.logo)"
            :alt="match.team2.name"
            class="w-14 h-14 object-contain bg-white p-1 rounded-full shadow-md"
          />
          <h3 class="mt-2 font-semibold text-white text-base text-center">
            {{ match.team2.name }}
          </h3>
        </div>
      </div>

      <!-- Match Info -->
      <div class="text-center mb-5">
        <p class="text-gray-200 font-medium">{{ match.date }}</p>
        <p class="text-gray-400 text-sm">{{ match.time }}</p>
      </div>

      <!-- Track Button -->
      <button
        @click="$emit('track', match)"
        class="w-full flex items-center justify-center gap-2 h-11 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-emerald-500/30 transition-all duration-200 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        Track Match
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  match: {
    type: Object,
    required: true,
  },
});

// League gradients
const getLeagueGradient = (league) => {
  if (league.includes("Premier")) return "bg-gradient-to-r from-red-700 to-red-900";
  if (league.includes("La Liga")) return "bg-gradient-to-r from-yellow-500 to-red-600";
  if (league.includes("Bundesliga")) return "bg-gradient-to-r from-red-600 to-black";
  if (league.includes("Serie A")) return "bg-gradient-to-r from-blue-800 to-gray-700";
  if (league.includes("Ligue 1")) return "bg-gradient-to-r from-blue-700 to-indigo-900";
  return "bg-gradient-to-r from-gray-600 to-gray-800";
};

// Fix logo paths (works with /public/logos/)
const fixLogo = (logo) => {
  if (!logo) return "/logos/placeholder.png"; // fallback if logo missing
  if (logo.startsWith("http")) return logo;   // absolute URL
  return `/logos/${logo}`; // default: load from public/logos/
};
</script>

<style scoped>
@reference "tailwindcss";
</style>
