<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">📋 我的行程</h1>
      <router-link
        to="/trips/new"
        class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all text-sm"
      >
        ➕ 新建行程
      </router-link>
    </div>

    <!-- 載入中 -->
    <div v-if="tripStore.loading" class="text-center py-16">
      <div class="text-4xl animate-pulse">⏳</div>
    </div>

    <!-- 空狀態 -->
    <div v-else-if="!tripStore.trips.length" class="text-center py-16 bg-white rounded-2xl shadow-warm border border-orange-50">
      <div class="text-5xl mb-4">🌍</div>
      <h2 class="text-xl font-bold text-gray-700 mb-2">開始你的第一次旅程</h2>
      <p class="text-gray-400 mb-6">還沒有行程，點擊下方按鈕建立第一個行程吧！</p>
      <router-link
        to="/trips/new"
        class="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md hover:shadow-lg transition-all"
      >
        ➕ 新建行程
      </router-link>
    </div>

    <!-- 行程列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="trip in tripStore.trips"
        :key="trip.id"
        @click="router.push(`/trips/${trip.id}`)"
        class="bg-white rounded-2xl shadow-warm p-5 border border-orange-50 hover:shadow-warm-lg hover:border-orange-100 transition-all cursor-pointer group"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-gray-800 group-hover:text-orange-600 transition text-lg">{{ trip.name }}</h3>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusClass(trip.status)">
                {{ statusLabel(trip.status) }}
              </span>
            </div>
            <p v-if="trip.destination" class="text-sm text-gray-400 mb-1">📍 {{ trip.destination }}</p>
            <p class="text-sm text-gray-400">
              📅 {{ formatDate(trip.startDate) }} ~ {{ formatDate(trip.endDate) }}
            </p>
            <p v-if="trip.familyName" class="text-xs text-orange-400 mt-1">👨‍👩‍👧‍👦 {{ trip.familyName }}</p>
          </div>
          <div class="text-gray-300 group-hover:text-orange-400 transition text-xl ml-4">→</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '../stores/trip'

const router = useRouter()
const tripStore = useTripStore()

const statusClass = (s) => ({
  planning: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-green-50 text-green-600',
  completed: 'bg-gray-100 text-gray-500'
})[s] || 'bg-gray-100'

const statusLabel = (s) => ({ planning: '規劃中', confirmed: '已確認', completed: '已完成' })[s] || s

const formatDate = (d) => {
  if (!d) return '未設定'
  return d.replace(/-/g, '/')
}

onMounted(() => {
  tripStore.fetchTrips()
})
</script>
