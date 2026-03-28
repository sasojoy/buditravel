import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// 路由設定
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/trips',
    name: 'Trips',
    component: () => import('../views/TripsView.vue'),
    meta: { requiresAuth: true }  // 需要登入
  },
  {
    path: '/trips/new',
    name: 'NewTrip',
    component: () => import('../views/TripEditView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trips/:id',
    name: 'TripDetail',
    component: () => import('../views/TripDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trips/:id/edit',
    name: 'TripEdit',
    component: () => import('../views/TripEditView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ski',
    name: 'SkiArea',
    component: () => import('../views/SkiAreaView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: () => import('../views/ExpensesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/todo',
    name: 'Todo',
    component: () => import('../views/TodoView.vue'),
    meta: { requiresAuth: true }
  }
]

// 建立路由器
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛：檢查登入狀態
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // 需要登入但未登入，導向登入頁
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isLoggedIn) {
    // 已登入卻訪問登入頁，導向首頁
    next({ name: 'Trips' })
  } else {
    next()
  }
})

export default router
