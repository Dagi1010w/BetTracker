import { reactive, computed } from 'vue'

// API configuration
const API_TOKEN = 'fcdf941a21d14663bb13cf7f25f3dab9'
const API_BASE_URL = 'https://api.football-data.org/v4' // Example API endpoint

// Reactive store state
const state = reactive({
  matches: [],
  trackedMatches: [],
  loading: false,
  error: null,
  searchQuery: ''
})

// Computed properties
const filteredMatches = computed(() => {
  if (!state.searchQuery) return state.matches
  
  const query = state.searchQuery.toLowerCase()
  return state.matches.filter(match =>
    match.team1.name.toLowerCase().includes(query) ||
    match.team2.name.toLowerCase().includes(query) ||
    match.league.toLowerCase().includes(query)
  )
})

// Methods
const fetchMatches = async () => {
  state.loading = true
  state.error = null
  
  try {
    // Use proxied API endpoint
    const response = await fetch(`/api/matches`, {
      headers: {
        'X-Auth-Token': API_TOKEN,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform API data to match our component structure
    state.matches = data.matches?.map(match => ({
      id: match.id,
      league: match.competition?.name || 'Unknown League',
      date: new Date(match.utcDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: new Date(match.utcDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      team1: {
        name: match.homeTeam?.name || 'Home Team',
        logo: match.homeTeam?.crest || '/logos/placeholder.png'
      },
      team2: {
        name: match.awayTeam?.name || 'Away Team',
        logo: match.awayTeam?.crest || '/logos/placeholder.png'
      }
    })) || []
    
  } catch (err) {
    state.error = err.message
    console.error('Failed to fetch matches:', err)
    
    // Fallback to sample data if API fails
    state.matches = getSampleMatches()
  } finally {
    state.loading = false
  }
}

const setSearchQuery = (query) => {
  state.searchQuery = query
}

// Tracked matches methods
const addTrackedMatch = (match) => {
  // Check if match is already tracked
  const isAlreadyTracked = state.trackedMatches.some(trackedMatch => trackedMatch.id === match.id);
  
  if (!isAlreadyTracked) {
    state.trackedMatches.push({
      ...match,
      status: 'UPCOMING',
      time: match.time,
      score: '0-0'
    });
  }
}

const removeTrackedMatch = (index) => {
  state.trackedMatches.splice(index, 1);
}

const getTrackedCount = computed(() => state.trackedMatches.length)

// Sample data fallback
const getSampleMatches = () => [
  {
    id: 1,
    league: 'La Liga',
    date: 'Oct 26, 2024',
    time: '15:00',
    team1: { name: 'Real Madrid', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjXq0QdFmSgX2s_RldE3oYh_sXJ6d9qO4yS8c3ZgXqg=s40-c' },
    team2: { name: 'Barcelona', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjVw-jO6_Q3e_g-l9Q2lH4g_FwR7jO2pYdO3xZg=s40-c' }
  },
  {
    id: 2,
    league: 'Premier League',
    date: 'Oct 27, 2024',
    time: '16:30',
    team1: { name: 'Arsenal', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjXq0QdFmSgX2s_RldE3oYh_sXJ6d9qO4yS8c3ZgXqg=s40-c' },
    team2: { name: 'Liverpool', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjVw-jO6_Q3e_g-l9Q2lH4g_FwR7jO2pYdO3xZg=s40-c' }
  },
  {
    id: 3,
    league: 'Serie A',
    date: 'Oct 28, 2024',
    time: '18:00',
    team1: { name: 'Juventus', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjXq0QdFmSgX2s_RldE3oYh_sXJ6d9qO4yS8c3ZgXqg=s40-c' },
    team2: { name: 'AC Milan', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjVw-jO6_Q3e_g-l9Q2lH4g_FwR7jO2pYdO3xZg=s40-c' }
  }
]

// Initialize with sample data on first load
if (state.matches.length === 0) {
  state.matches = getSampleMatches()
}

// Export the store
export const useMatchesStore = () => {
  return {
    // State
    matches: computed(() => state.matches),
    trackedMatches: computed(() => state.trackedMatches),
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    searchQuery: computed(() => state.searchQuery),
    
    // Computed
    filteredMatches,
    trackedCount: getTrackedCount,
    
    // Methods
    fetchMatches,
    setSearchQuery,
    addTrackedMatch,
    removeTrackedMatch
  }
}
