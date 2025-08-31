import { reactive, computed } from 'vue'

// API configuration
const API_TOKEN = 'c30b1ded305543769924ae91cbc8258e'
const API_BASE_URL = 'https://api.football-data.org/v4' // Example API endpoint

// Reactive store state
const state = reactive({
  matches: [],
  trackedMatches: JSON.parse(localStorage.getItem('trackedMatches') || '[]'),
  loading: false,
  error: null,
  searchQuery: '',
  currentPage: 1,
  pageSize: 20,
  totalMatches: 0
})

// Save tracked matches to localStorage
const saveTrackedMatches = () => {
  localStorage.setItem('trackedMatches', JSON.stringify(state.trackedMatches))
}

// Computed properties
const filteredMatches = computed(() => {
  if (!state.searchQuery) {
    // When not searching, only show upcoming and live matches
    return state.matches.filter(match =>
      match.status === 'SCHEDULED' ||
      match.status === 'TIMED' ||
      match.status === 'LIVE' ||
      match.status === 'IN_PLAY'
    )
  }

  // When searching, show ALL upcoming/live matches first, then previous matches that match the search
  const query = state.searchQuery.toLowerCase()
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  const upcomingMatches = state.matches.filter(match =>
    (match.status === 'SCHEDULED' ||
    match.status === 'TIMED' ||
    match.status === 'LIVE' ||
    match.status === 'IN_PLAY') &&
    (match.team1.name.toLowerCase().includes(query) ||
    match.team2.name.toLowerCase().includes(query) ||
    match.league.toLowerCase().includes(query))
  )

  const previousMatches = state.matches.filter(match => {
    const matchesQuery = match.team1.name.toLowerCase().includes(query) ||
                        match.team2.name.toLowerCase().includes(query) ||
                        match.league.toLowerCase().includes(query)

    return match.status === 'FINISHED' &&
           new Date(match.utcDate) >= threeDaysAgo &&
           matchesQuery
  })

  // Combine: upcoming matches first, then previous matches
  return [...upcomingMatches, ...previousMatches]
})

const paginatedMatches = computed(() => {
  const start = (state.currentPage - 1) * state.pageSize
  const end = start + state.pageSize
  return filteredMatches.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredMatches.value.length / state.pageSize))

// Methods
const fetchMatches = async () => {
  state.loading = true
  state.error = null

  try {
    // Get current date range for matches (past 7 days to next 7 days)
    const past7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Big 5 leagues: PL (Premier League), PD (La Liga), BL1 (Bundesliga), SA (Serie A), FL1 (Ligue 1)
    const competitions = ['PL', 'PD', 'BL1', 'SA', 'FL1']
    const allMatches = []

    // Fetch matches from all big 5 leagues
    for (const comp of competitions) {
      try {
        const response = await fetch(`/api/competitions/${comp}/matches?dateFrom=${past7Days}&dateTo=${next7Days}`, {
          headers: {
            'X-Auth-Token': API_TOKEN,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.matches) {
            allMatches.push(...data.matches)
          }
        } else {
          console.warn(`Failed to fetch ${comp} matches: ${response.status} ${response.statusText}`)
        }
      } catch (err) {
        console.warn(`Failed to fetch ${comp} matches:`, err.message)
      }
    }

    // Sort matches by status priority, then by date
    const statusPriority = {
      'LIVE': 1,
      'IN_PLAY': 1,
      'SCHEDULED': 2,
      'FINISHED': 3,
      'POSTPONED': 3,
      'CANCELLED': 3,
      'SUSPENDED': 3
    };

    allMatches.sort((a, b) => {
      const aPriority = statusPriority[a.status] || 4;
      const bPriority = statusPriority[b.status] || 4;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // If same priority, sort by date
      return new Date(a.utcDate) - new Date(b.utcDate);
    });

    // Transform API data to match our component structure
    state.matches = allMatches.map(match => ({
      id: match.id,
      utcDate: match.utcDate, // Keep original UTC date for filtering
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
      },
      status: match.status || 'SCHEDULED',
      minute: match.minute || null,
      score: (() => {
        if (!match.score) return '0-0';

        // Use fullTime score if available (most common for finished matches)
        if (match.score.fullTime && match.score.fullTime.home !== null && match.score.fullTime.away !== null) {
          return `${match.score.fullTime.home}-${match.score.fullTime.away}`;
        }

        // Use regularTime for matches that went to extra time
        if (match.score.regularTime && match.score.regularTime.home !== null && match.score.regularTime.away !== null) {
          return `${match.score.regularTime.home}-${match.score.regularTime.away}`;
        }

        // Use current score for live matches
        if (match.score.current && match.score.current.home !== null && match.score.current.away !== null) {
          return `${match.score.current.home}-${match.score.current.away}`;
        }

        // Fallback to direct home/away properties
        if (match.score.home !== null && match.score.away !== null) {
          return `${match.score.home}-${match.score.away}`;
        }

        return '0-0';
      })(),
      title: `${match.homeTeam?.name || 'Home Team'} vs ${match.awayTeam?.name || 'Away Team'}`,
      stats: match.bookings ? {
        yellow: match.bookings.filter(b => b.card === 'YELLOW_CARD').length,
        red: match.bookings.filter(b => b.card === 'RED_CARD').length
      } : null
    }))

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
  state.currentPage = 1 // Reset to first page when searching
}

const setCurrentPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    state.currentPage = page
  }
}

const nextPage = () => {
  if (state.currentPage < totalPages.value) {
    state.currentPage++
  }
}

const prevPage = () => {
  if (state.currentPage > 1) {
    state.currentPage--
  }
}

// Tracked matches methods
const addTrackedMatch = (match) => {
  // Check if match is already tracked
  const isAlreadyTracked = state.trackedMatches.some(trackedMatch => trackedMatch.id === match.id);

  if (!isAlreadyTracked) {
    state.trackedMatches.push(match);
    saveTrackedMatches();
  }
}

const removeTrackedMatch = (index) => {
  state.trackedMatches.splice(index, 1);
  saveTrackedMatches();
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
    team2: { name: 'Barcelona', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjVw-jO6_Q3e_g-l9Q2lH4g_FwR7jO2pYdO3xZg=s40-c' },
    status: 'SCHEDULED',
    score: '0-0',
    title: 'Real Madrid vs Barcelona'
  },
  {
    id: 2,
    league: 'Premier League',
    date: 'Oct 27, 2024',
    time: '16:30',
    team1: { name: 'Arsenal', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjXq0QdFmSgX2s_RldE3oYh_sXJ6d9qO4yS8c3ZgXqg=s40-c' },
    team2: { name: 'Liverpool', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjVw-jO6_Q3e_g-l9Q2lH4g_FwR7jO2pYdO3xZg=s40-c' },
    status: 'SCHEDULED',
    score: '0-0',
    title: 'Arsenal vs Liverpool'
  },
  {
    id: 3,
    league: 'Serie A',
    date: 'Oct 28, 2024',
    time: '18:00',
    team1: { name: 'Juventus', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjXq0QdFmSgX2s_RldE3oYh_sXJ6d9qO4yS8c3ZgXqg=s40-c' },
    team2: { name: 'AC Milan', logo: 'https://lh3.googleusercontent.com/a-/ALV-UjVw-jO6_Q3e_g-l9Q2lH4g_FwR7jO2pYdO3xZg=s40-c' },
    status: 'SCHEDULED',
    score: '0-0',
    title: 'Juventus vs AC Milan'
  }
]

// Initialize with sample data on first load
if (state.matches.length === 0) {
  state.matches = getSampleMatches()
}

const updateTrackedMatches = () => {
  // Update trackedMatches status and score based on latest matches data
  // But don't change status to 'FINISHED' to keep tracked matches active
  state.trackedMatches = state.trackedMatches.map(trackedMatch => {
    const latestMatch = state.matches.find(m => m.id === trackedMatch.id);
    if (latestMatch) {
      return {
        ...trackedMatch,
        status: latestMatch.status === 'FINISHED' ? trackedMatch.status : latestMatch.status,
        score: latestMatch.score,
        time: latestMatch.time,
        minute: latestMatch.minute,
        title: latestMatch.title
      };
    }
    return trackedMatch;
  });
};

let liveUpdateInterval = null;

const startLiveUpdates = (intervalMs = 30000) => {
  if (liveUpdateInterval) return; // Already running
  liveUpdateInterval = setInterval(async () => {
    await fetchMatches();
    updateTrackedMatches();
  }, intervalMs);
};

const stopLiveUpdates = () => {
  if (liveUpdateInterval) {
    clearInterval(liveUpdateInterval);
    liveUpdateInterval = null;
  }
};

// Export the store
export const useMatchesStore = () => {
  return {
    // State
    matches: computed(() => state.matches),
    trackedMatches: computed(() => state.trackedMatches),
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    searchQuery: computed(() => state.searchQuery),
    currentPage: computed(() => state.currentPage),
    pageSize: computed(() => state.pageSize),

    // Computed
    filteredMatches,
    paginatedMatches,
    totalPages,
    trackedCount: getTrackedCount,

    // Methods
    fetchMatches,
    setSearchQuery,
    addTrackedMatch,
    removeTrackedMatch,
    setCurrentPage,
    nextPage,
    prevPage,
    startLiveUpdates,
    stopLiveUpdates
  }
}
