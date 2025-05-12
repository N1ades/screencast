import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Donate from '../components/Donate.vue';
import ContactMe from '../components/ContactMe.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/donate', name: 'Donate', component: Donate },
  { path: '/contact', name: 'ContactMe', component: ContactMe },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;