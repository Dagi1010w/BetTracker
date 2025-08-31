# TODO: Fix Matches Results Issues

## Identified Issues
- [x] API endpoint path incorrect - using `/api/competitions/` but should be `/v4/competitions/` after proxy rewrite
- [x] Score extraction logic overly complex with debug console.logs
- [ ] Date range filtering might be too restrictive (only 3 days past/future)
- [ ] API token may be expired or invalid
- [ ] Match status mapping might be incorrect
- [ ] League name extraction from API response needs verification

## Tasks
- [ ] Fix API endpoint URL construction
- [ ] Simplify and fix score extraction logic
- [ ] Expand date range for better match coverage
- [ ] Add better error handling for API failures
- [ ] Clean up debug console.log statements
- [ ] Verify league name mapping from API
- [ ] Test with different match statuses (LIVE, FINISHED, etc.)
- [ ] Add fallback for when API is unavailable

## Files to Edit
- src/store/matches.js - Main fixes for API calls and data processing
- vite.config.js - Verify proxy configuration
