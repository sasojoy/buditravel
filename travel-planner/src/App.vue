<template>
  <div class="min-h-screen" style="background: linear-gradient(135deg, #FFFBF5 0%, #FFF7ED 50%, #F0FDFA 100%);">
    <!-- 頂部導航列 -->
    <nav class="backdrop-blur-md bg-white/80 shadow-sm sticky top-0 z-50 border-b border-orange-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition">
              <span class="text-white text-xl">✈️</span>
            </div>
            <div>
              <span class="font-bold text-lg text-gray-800">FamilyTrip</span>
              <span class="hidden sm:block text-xs text-gray-400 -mt-1">家族旅遊規劃</span>
            </div>
          </router-link>

          <!-- 導航連結（桌面） -->
          <div class="hidden md:flex items-center space-x-1">
            <template v-if="authStore.isLoggedIn">
              <router-link
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                class="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all"
                active-class="text-orange-600 bg-orange-50"
              >
                <span class="mr-1">{{ item.emoji }}</span>
                {{ item.label }}
              </router-link>
              <button
                @click="handleLogout"
                class="ml-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                登出
              </button>
            </template>
            <template v-else>
              <router-link to="/login" class="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition">
                登入
              </router-link>
              <router-link to="/register" class="ml-1 px-5 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all">
                免費加入
              </router-link>
            </template>
          </div>

          <!-- 手機選單按鈕 -->
          <button
            v-if="authStore.isLoggedIn"
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 rounded-xl hover:bg-orange-50 transition"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>

        <!-- 手機選單 -->
        <div v-if="showMobileMenu && authStore.isLoggedIn" class="md:hidden pb-4 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="showMobileMenu = false"
            class="flex items-center py-3 px-4 rounded-xl text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition"
          >
            <span class="mr-3 text-lg">{{ item.emoji }}</span>
            {{ item.label }}
          </router-link>
          <button
            @click="handleLogout"
            class="w-full flex items-center py-3 px-4 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
          >
            <span class="mr-3 text-lg">🚪</span>
            登出
          </button>
        </div>
      </div>
    </nav>

    <!-- 主內容區 -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <router-view />
    </main>

    <!-- 底部版權 -->
    <footer class="text-center text-gray-400 text-sm py-6 mt-8">
      <p>Made with ☀️ for family adventures</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showMobileMenu = ref(false)

const navItems = [
  { path: '/trips', label: '行程', emoji: '📋' },
  { path: '/ski', label: '滑雪攻略', emoji: '⛷️' },
  { path: '/expenses', label: '費用', emoji: '💰' },
  { path: '/todo', label: '待辦', emoji: '✅' },
]

onMounted(() => {
  authStore.initAuth()
  if (!authStore.isLoggedIn && router.currentRoute.value.meta.requiresAuth) {
    router.push('/login')
  }
})

const handleLogout = () => {
  authStore.logout()
  showMobileMenu.value = false
  router.push('/login')
}
</script>
