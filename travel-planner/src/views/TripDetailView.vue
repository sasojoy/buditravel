<template>
  <div class="space-y-6">
    <!-- 返回 -->
    <button @click="router.back()" class="flex items-center text-gray-500 hover:text-orange-500 transition text-sm">
      <span class="mr-1">←</span> 返回
    </button>

    <div v-if="tripStore.loading" class="text-center py-16">
      <div class="text-4xl animate-pulse">⏳</div>
    </div>

    <div v-else-if="trip" class="space-y-6">
      <!-- 行程標題卡 -->
      <div class="bg-white rounded-2xl shadow-warm p-6 border border-orange-50">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ trip.name }}</h1>
            <p class="text-gray-400 mt-1 text-sm flex items-center">
              <span class="mr-1">📅</span> {{ formatDate(trip.startDate) }} ~ {{ formatDate(trip.endDate) }}
            </p>
            <p v-if="trip.destination" class="text-gray-400 text-sm flex items-center mt-1">
              <span class="mr-1">📍</span> {{ trip.destination }}
            </p>
          </div>
          <span class="px-3 py-1 rounded-full text-sm font-medium" :class="statusClass(trip.status)">
            {{ statusLabel(trip.status) }}
          </span>
        </div>
        <div class="flex gap-2">
          <button @click="router.push(`/trips/${trip.id}/edit`)" class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-600 text-sm transition">
            ✏️ 編輯行程
          </button>
        </div>
      </div>

      <!-- 行程內容（項目） -->
      <div class="bg-white rounded-2xl shadow-warm p-6 border border-orange-50">
        <h2 class="text-lg font-bold text-gray-800 mb-4">📋 行程內容</h2>

        <!-- 新增項目表單 -->
        <form @submit.prevent="addItem" class="mb-5 p-4 bg-orange-50/50 rounded-2xl space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <input v-model="newItem.date" type="date" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-orange-200" />
            <input v-model="newItem.time" type="time" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-orange-200" />
          </div>
          <input v-model="newItem.title" type="text" placeholder="項目標題 *" required class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-orange-200" />
          <input v-model="newItem.location" type="text" placeholder="地點" class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-orange-200" />
          <textarea v-model="newItem.notes" rows="2" placeholder="備註" class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-orange-200 resize-none"></textarea>
          <button type="submit" :disabled="!newItem.title.trim()" class="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow hover:shadow-lg disabled:opacity-50 transition">
            ➕ 新增項目
          </button>
        </form>

        <!-- 項目列表 -->
        <div v-if="trip.items && trip.items.length > 0" class="space-y-3">
          <div
            v-for="item in trip.items"
            :key="item.id"
            class="flex items-start gap-3 p-4 rounded-xl hover:bg-orange-50/30 transition group border border-transparent hover:border-orange-100"
          >
            <div class="flex-shrink-0 w-20 text-xs text-gray-400 pt-1">
              <div>{{ item.date }}</div>
              <div v-if="item.time" class="text-orange-400">{{ item.time }}</div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-800">{{ item.title }}</div>
              <div v-if="item.location" class="text-sm text-gray-400 mt-0.5">📍 {{ item.location }}</div>
              <div v-if="item.notes" class="text-sm text-gray-500 mt-1">{{ item.notes }}</div>
            </div>
            <button @click="deleteItem(item.id)" class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition text-sm flex-shrink-0 p-1">🗑️</button>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-400">
          <div class="text-3xl mb-2">📝</div>
          <p class="text-sm">還沒有行程項目，試著新增第一個吧！</p>
        </div>
      </div>

      <!-- 待辦事項（該行程） -->
      <div v-if="trip.todos && trip.todos.length > 0" class="bg-white rounded-2xl shadow-warm p-6 border border-orange-50">
        <h2 class="text-lg font-bold text-gray-800 mb-4">✅ 待辦事項</h2>
        <div class="space-y-2">
          <div v-for="todo in trip.todos" :key="todo.id" class="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50/30 transition">
            <input type="checkbox" :checked="!!todo.isCompleted" @change="toggleTodoInTrip(todo)" class="w-4 h-4 rounded text-orange-500" />
            <span :class="todo.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'" class="text-sm">{{ todo.title }}</span>
          </div>
        </div>
      </div>

      <!-- 住宿 -->
      <div v-if="trip.accommodations && trip.accommodations.length > 0" class="bg-white rounded-2xl shadow-warm p-6 border border-orange-50">
        <h2 class="text-lg font-bold text-gray-800 mb-4">🏨 住宿</h2>
        <div class="space-y-3">
          <div v-for="acc in trip.accommodations" :key="acc.id" class="p-4 bg-gray-50 rounded-xl">
            <div class="font-medium text-gray-800">{{ acc.name }}</div>
            <div v-if="acc.address" class="text-sm text-gray-400 mt-1">{{ acc.address }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ formatDate(acc.checkIn) }} ~ {{ formatDate(acc.checkOut) }}</div>
          </div>
        </div>
      </div>

      <!-- 留言板 -->
      <div class="bg-white rounded-2xl shadow-warm p-6 border border-orange-50">
        <h2 class="text-lg font-bold text-gray-800 mb-4">💬 留言</h2>
        <form @submit.prevent="addMessage" class="mb-4 flex gap-2">
          <input v-model="newMessage" type="text" placeholder="留言..." class="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 text-sm" />
          <button type="submit" :disabled="!newMessage.trim()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium disabled:opacity-50 transition">送出</button>
        </form>
        <div v-if="trip.messages && trip.messages.length > 0" class="space-y-2">
          <div v-for="msg in trip.messages" :key="msg.id" class="flex gap-3 p-3 bg-gray-50 rounded-xl">
            <div class="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-orange-600">{{ (msg.username || '？')[0] }}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">{{ msg.username || '匿名' }}</span>
                <span class="text-xs text-gray-300">{{ formatDate(msg.createdAt) }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-0.5">{{ msg.content }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-6 text-gray-400 text-sm">還沒有留言</div>
      </div>

      <!-- 備註 -->
      <div v-if="trip.notes" class="bg-white rounded-2xl shadow-warm p-6 border border-orange-50">
        <h2 class="text-lg font-bold text-gray-800 mb-3">📝 備註</h2>
        <p class="text-gray-600 text-sm whitespace-pre-wrap">{{ trip.notes }}</p>
      </div>
    </div>

    <div v-else class="text-center py-16 text-gray-400">
      <div class="text-4xl mb-3">❓</div>
      <p>找不到這個行程</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTripStore } from '../stores/trip'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const tripStore = useTripStore()

const trip = ref(null)
const newMessage = ref('')
const newItem = ref({ date: '', time: '', title: '', location: '', notes: '' })

const statusClass = (s) => ({
  planning: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-green-50 text-green-600',
  completed: 'bg-gray-100 text-gray-500'
})[s] || 'bg-gray-100 text-gray-500'

const statusLabel = (s) => ({ planning: '規劃中', confirmed: '已確認', completed: '已完成' })[s] || s

const formatDate = (d) => {
  if (!d) return '-'
  return d.replace(/-/g, '/')
}

const loadTrip = async () => {
  const result = await tripStore.fetchTrip(route.params.id)
  if (result.success) {
    trip.value = tripStore.currentTrip
  }
}

const addItem = async () => {
  if (!newItem.value.title.trim()) return
  try {
    const response = await axios.post(`/api/trips/${trip.value.id}/items`, newItem.value)
    trip.value.items = [...(trip.value.items || []), response.data]
    newItem.value = { date: '', time: '', title: '', location: '', notes: '' }
  } catch (err) {
    alert('新增項目失敗')
  }
}

const deleteItem = async (itemId) => {
  if (!confirm('刪除這個項目？')) return
  try {
    await axios.delete(`/api/trips/${trip.value.id}/items/${itemId}`)
    trip.value.items = trip.value.items.filter(i => i.id !== itemId)
  } catch (err) {
    alert('刪除失敗')
  }
}

const toggleTodoInTrip = async (todo) => {
  try {
    await axios.put(`/api/todos/${todo.id}`, { isCompleted: !todo.isCompleted })
    todo.isCompleted = todo.isCompleted ? 0 : 1
  } catch (err) {
    alert('更新失敗')
  }
}

const addMessage = async () => {
  if (!newMessage.value.trim() || !trip.value) return
  try {
    const response = await axios.post(`/api/trips/${trip.value.id}/messages`, { content: newMessage.value.trim() })
    trip.value.messages = [response.data, ...(trip.value.messages || [])]
    newMessage.value = ''
  } catch (err) {
    alert('留言失敗')
  }
}

onMounted(() => { loadTrip() })
</script>
