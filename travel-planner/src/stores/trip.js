import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// 行程狀態管理
export const useTripStore = defineStore('trip', () => {
  // 狀態
  const trips = ref([])
  const currentTrip = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 取得所有行程
  const fetchTrips = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get('/api/trips')
      trips.value = response.data
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || '取得行程失敗'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 取得單一行程
  const fetchTrip = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get(`/api/trips/${id}`)
      currentTrip.value = response.data
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || '取得行程失敗'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 建立行程
  const createTrip = async (tripData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post('/api/trips', tripData)
      trips.value.unshift(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || '建立行程失敗'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 更新行程
  const updateTrip = async (id, tripData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.put(`/api/trips/${id}`, tripData)
      
      // 更新本地列表
      const index = trips.value.findIndex(t => t.id === id)
      if (index !== -1) {
        trips.value[index] = response.data
      }
      
      // 更新 currentTrip
      if (currentTrip.value?.id === id) {
        currentTrip.value = response.data
      }
      
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || '更新行程失敗'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 刪除行程
  const deleteTrip = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      await axios.delete(`/api/trips/${id}`)
      
      // 從本地列表移除
      trips.value = trips.value.filter(t => t.id !== id)
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || '刪除行程失敗'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 複製行程
  const copyTrip = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post(`/api/trips/${id}/copy`)
      trips.value.unshift(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || '複製行程失敗'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    trips,
    currentTrip,
    loading,
    error,
    fetchTrips,
    fetchTrip,
    createTrip,
    updateTrip,
    deleteTrip,
    copyTrip
  }
})
