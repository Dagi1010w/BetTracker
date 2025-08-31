// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// Import your views/components
import Home from '@/pages/Home.vue';
import Tracked from '@/pages/Tracked.vue';
import MatchesDetail from '@/pages/MatchesDetail.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/Tracked', name: 'Tracked', component: Tracked },
  { path: '/matches/:id', name: 'MatchesDetail', component: MatchesDetail },
  // Add other routes later if needed
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
