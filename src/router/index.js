import { createRouter, createWebHistory } from 'vue-router'

import LoginFormPage from '../pages/login'
import ChatBoxPage from '../pages/chatbox'

const routes = [
  { path: '/login', component: LoginFormPage },
  { path: '/chatbox', component: ChatBoxPage, name: 'ChatBoxPage' , meta: { requiresAuth: true } },
  { path: '/', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const isUserAuthenticated = localStorage.getItem('user') !== null;

    if (!isUserAuthenticated) {
      next({ path: '/login' });
    } else {
      next();
    }
  } else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    next();
  }
});

export default router