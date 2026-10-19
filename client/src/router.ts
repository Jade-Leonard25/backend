// router.ts
import { createRouter, createWebHistory } from 'vue-router';
import Home from './Home.vue';
import Email from './Email.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/send-email', component: Email }
]

export const router = createRouter({
  history: createWebHistory(), // 👈 Use this for standard SPAs
  routes
})