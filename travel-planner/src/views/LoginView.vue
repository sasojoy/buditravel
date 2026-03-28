<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg mb-4">
          <span class="text-3xl">✈️</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">歡迎使用 FamilyTrip</h1>
        <p class="text-gray-400 mt-2 text-sm">選擇你的身份開始使用</p>
      </div>

      <!-- 身份選擇卡片 -->
      <div class="bg-white rounded-3xl shadow-warm p-6 border border-orange-50">
        <!-- 載入中 -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p class="text-gray-400 mt-3 text-sm">載入中...</p>
        </div>

        <!-- 身份列表 -->
        <div v-else-if="familyMembers.length > 0" class="space-y-3">
          <p class="text-sm text-gray-500 text-center mb-4">👇 點選你的身份</p>
          <button
            v-for="member in familyMembers"
            :key="member.id"
            @click="loginAs(member)"
            class="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-orange-300 hover:bg-orange-50/50 transition-all flex items-center gap-4 group"
          >
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-xl">
              {{ member.emoji || '👤' }}
            </div>
            <div class="text-left flex-1">
              <div class="font-bold text-gray-800 group-hover:text-orange-600">{{ member.username }}</div>
              <div class="text-sm text-gray-400">{{ member.familyName ? `🌸 ${member.familyName}` : '尚未加入家族' }}</div>
            </div>
            <div class="text-orange-400 group-hover:text-orange-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </button>
        </div>

        <!-- 沒有成員 -->
        <div v-else class="text-center py-8">
          <p class="text-gray-400 mb-4">尚無註冊會員</p>
          <router-link
            to="/register"
            class="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md hover:shadow-lg transition"
          >
            立即註冊
          </router-link>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="error" class="mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
          {{ error }}
        </div>
      </div>

      <!-- 返回首頁 -->
      <div class="text-center mt-4">
        <router-link to="/" class="text-sm text-gray-400 hover:text-gray-600 transition">
          ← 返回首頁
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const familyMembers = ref([])

onMounted(async () => {
  try {
    // 取得所有已註冊的會員（身份列表）
    const response = await axios.get('/api/auth/members')
    familyMembers.value = response.data.members || []
  } catch (err) {
    console.error('取得會員列表失敗:', err)
    error.value = '無法載入會員列表'
  } finally {
    loading.value = false
  }
})

const loginAs = async (member) => {
  error.value = null
  try {
    // 呼叫快速登入 API
    const response = await axios.post('/api/auth/quick-login', { memberId: member.id })
    authStore.setAuth(response.data.token, response.data.user)
    router.push('/trips')
  } catch (err) {
    error.value = '登入失敗，請稍後再試'
    console.error('登入錯誤:', err)
  }
}
</script>
