// src/router.ts
import { createRouter, createWebHistory } from 'vue-router';
import VRCast from './components/VRCast.vue';
import Donate from './components/Donate.vue';

const routes = [
  { path: '/', component: VRCast },
  { path: '/donate', component: Donate },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
