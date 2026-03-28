<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg mb-4">
          <span class="text-3xl">✈️</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">加入 FamilyTrip</h1>
        <p class="text-gray-400 mt-2 text-sm">免費註冊，開始記錄家族旅遊</p>
      </div>

      <div class="bg-white rounded-3xl shadow-warm p-6 border border-orange-50">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">帳號名稱</label>
            <input v-model="form.username" type="text" required minlength="2" placeholder="你的名字"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition text-gray-700" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <input v-model="form.email" type="email" required placeholder="your@email.com"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition text-gray-700" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">密碼</label>
            <input v-model="form.password" type="password" required minlength="6" placeholder="至少6個字"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition text-gray-700" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">家族名稱 <span class="text-gray-400 font-normal">(選填)</span></label>
            <input v-model="form.familyName" type="text" placeholder="例如：黃家"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition text-gray-700" />
          </div>

          <div v-if="error" class="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{{ error }}</div>

          <button type="submit" :disabled="loading"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition">
            {{ loading ? '註冊中...' : '免費註冊' }}
          </button>
        </form>

        <div class="mt-5 text-center">
          <p class="text-gray-400 text-sm">
            已經有帳號？
            <router-link to="/login" class="text-orange-500 hover:text-orange-600 font-medium">立即登入</router-link>
          </p>
        </div>
      </div>

      <div class="text-center mt-4">
        <router-link to="/" class="text-sm text-gray-400 hover:text-gray-600 transition">← 返回首頁</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ username: '', email: '', password: '', familyName: '' })
const loading = ref(false)
const error = ref(null)

const handleRegister = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.post('/api/auth/register', form.value)
    if (response.data.token) {
      authStore.setAuth(response.data.token, response.data.user)
      router.push('/trips')
    }
  } catch (err) {
    error.value = err.response?.data?.message || '註冊失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>
