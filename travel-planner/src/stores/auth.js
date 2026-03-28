import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 認證狀態管理
export const useAuthStore = defineStore('auth', () => {
  // 狀態
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 初始化：檢查本地存儲的 token
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      } catch (e) {
        // JSON 解析失敗，清除無效資料
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        token.value = null
        user.value = null
      }
    }
  }

  // 設定用戶資料（登入後調用）
  const setAuth = (tokenValue, userData) => {
    token.value = tokenValue
    user.value = userData
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('familyMember')
  }

  // 清除錯誤
  const clearError = () => {
    error.value = null
  }

  // 計算屬性：是否已登入
  const isLoggedIn = computed(() => !!token.value)

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    initAuth,
    setAuth,
    logout,
    clearError
  }
})
