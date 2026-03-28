import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './stores/auth'

// 建立 Vue 應用
const app = createApp(App)

// 使用 Pinia 狀態管理
const pinia = createPinia()
app.use(pinia)

// 初始化認證（此時 pinia 已啟用，authStore 可以正常運作）
const authStore = useAuthStore()
authStore.initAuth()

// axios 請求 interceptor：自動附加 Authorization header
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 使用 Vue Router
app.use(router)

// 掛載應用
app.mount('#app')
