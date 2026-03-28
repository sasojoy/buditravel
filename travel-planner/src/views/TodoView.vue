<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">✅ 待辦事項</h1>
      <!-- 行程篩選 -->
      <select
        v-if="trips.length > 0"
        v-model="selectedTripId"
        @change="loadTodos"
        class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
      >
        <option value="">全部行程</option>
        <option v-for="trip in trips" :key="trip.id" :value="trip.id">
          {{ trip.name }}
        </option>
      </select>
    </div>

    <!-- 新增待辦 -->
    <div class="bg-white rounded-2xl shadow-warm p-5 border border-orange-50">
      <form @submit.prevent="addTodo" class="space-y-3">
        <input
          v-model="newTodo.title"
          type="text"
          placeholder="待辦事項..."
          class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition text-gray-700"
        />
        <div class="flex flex-wrap gap-2">
          <select
            v-model="newTodo.tripId"
            class="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 focus:ring-2 focus:ring-orange-200"
          >
            <option value="">選擇行程（可選）</option>
            <option v-for="trip in trips" :key="trip.id" :value="trip.id">
              {{ trip.name }}
            </option>
          </select>
          <input
            v-model="newTodo.dueDate"
            type="date"
            class="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 focus:ring-2 focus:ring-orange-200"
          />
          <select v-model="newTodo.priority" class="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 focus:ring-2 focus:ring-orange-200">
            <option value="low">🟢 低</option>
            <option value="normal">🟡 普通</option>
            <option value="high">🔴 高</option>
          </select>
          <button
            type="submit"
            :disabled="!newTodo.title.trim()"
            class="ml-auto px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 transition"
          >
            新增
          </button>
        </div>
      </form>
    </div>

    <!-- 進度概覽 -->
    <div v-if="todos.length > 0" class="bg-white rounded-2xl shadow-warm p-5 border border-orange-50">
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-medium text-gray-600">
          {{ completedCount }} / {{ todos.length }} 完成
        </span>
        <span class="text-sm font-bold" :class="progressColorClass">{{ progressPercent }}%</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-3">
        <div
          class="h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- 待辦列表 -->
    <div class="bg-white rounded-2xl shadow-warm p-5 border border-orange-50">
      <div v-if="todos.length > 0" class="space-y-2">
        <div
          v-for="todo in todos"
          :key="todo.id"
          class="flex items-center gap-3 p-4 rounded-xl hover:bg-orange-50/50 transition group"
        >
          <input
            type="checkbox"
            :checked="!!todo.isCompleted"
            @change="toggleTodo(todo)"
            class="w-5 h-5 rounded-lg text-orange-500 focus:ring-orange-300 flex-shrink-0 cursor-pointer"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                :class="['font-medium', todo.isCompleted ? 'line-through text-gray-400' : 'text-gray-800']"
              >
                {{ todo.title }}
              </span>
              <span v-if="todo.priority === 'high'" class="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-xs font-medium">高優</span>
              <span v-if="todo.priority === 'low'" class="px-2 py-0.5 rounded-full bg-green-50 text-green-500 text-xs">低</span>
            </div>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span v-if="todo.tripName" class="text-orange-400">📋 {{ todo.tripName }}</span>
              <span v-if="todo.dueDate">📅 {{ formatDate(todo.dueDate) }}</span>
            </div>
          </div>
          <button
            @click="deleteTodo(todo.id)"
            class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition p-1"
          >
            🗑️
          </button>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="text-4xl mb-3">📝</div>
        <p class="text-gray-400">還沒有待辦事項</p>
        <p class="text-sm text-gray-300 mt-1">新增你的第一個待辦吧！</p>
      </div>
    </div>

    <!-- 快速範本（滑雪行前準備） -->
    <details class="bg-white rounded-2xl shadow-warm p-5 border border-orange-50 group">
      <summary class="cursor-pointer text-sm font-medium text-gray-500 hover:text-orange-500 transition list-none flex items-center">
        <span class="mr-2">📋</span> 滑雪行前準備範本
        <span class="ml-auto group-open:rotate-90 transition-transform">▶</span>
      </summary>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
        <button
          v-for="tpl in templates"
          :key="tpl"
          @click="addFromTemplate(tpl)"
          class="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-orange-50 rounded-xl transition text-gray-600 hover:text-orange-600"
        >
          ➕ {{ tpl }}
        </button>
      </div>
    </details>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const todos = ref([])
const trips = ref([])
const selectedTripId = ref('')
const newTodo = ref({ title: '', tripId: '', dueDate: '', priority: 'normal' })

const templates = ['預訂機票', '預訂住宿', '購買滑雪票', '租借雪具', '預訂滑雪教練', '打包行李', '兌換日幣', '購買旅遊保險', '預約機場接送', '下載滑雪場APP']

const completedCount = computed(() => todos.value.filter(t => t.isCompleted).length)
const progressPercent = computed(() => {
  if (todos.value.length === 0) return 0
  return Math.round((completedCount.value / todos.value.length) * 100)
})
const progressColorClass = computed(() => {
  if (progressPercent.value === 100) return 'text-green-500'
  if (progressPercent.value >= 60) return 'text-orange-500'
  return 'text-gray-400'
})

const loadTodos = async () => {
  try {
    const params = selectedTripId.value ? { tripId: selectedTripId.value } : {}
    const response = await axios.get('/api/todos', { params })
    todos.value = response.data
  } catch (err) {
    console.error('載入待辦失敗', err)
  }
}

const loadTrips = async () => {
  try {
    const response = await axios.get('/api/trips')
    trips.value = response.data
  } catch (err) {
    console.error('載入行程失敗', err)
  }
}

const addTodo = async () => {
  if (!newTodo.value.title.trim()) return
  try {
    const payload = {
      title: newTodo.value.title.trim(),
      priority: newTodo.value.priority,
      dueDate: newTodo.value.dueDate || undefined,
      tripId: newTodo.value.tripId || undefined
    }
    const response = await axios.post('/api/todos', payload)
    todos.value.unshift(response.data)
    newTodo.value = { title: '', tripId: '', dueDate: '', priority: 'normal' }
  } catch (err) {
    alert('新增失敗')
  }
}

const addFromTemplate = async (tpl) => {
  if (todos.value.some(t => t.title === tpl)) return
  try {
    const response = await axios.post('/api/todos', { title: tpl })
    todos.value.unshift(response.data)
  } catch (err) {}
}

const toggleTodo = async (todo) => {
  try {
    await axios.put(`/api/todos/${todo.id}`, { isCompleted: !todo.isCompleted })
    todo.isCompleted = todo.isCompleted ? 0 : 1
  } catch (err) {
    alert('更新失敗')
  }
}

const deleteTodo = async (id) => {
  if (!confirm('確定要刪除嗎？')) return
  try {
    await axios.delete(`/api/todos/${id}`)
    todos.value = todos.value.filter(t => t.id !== id)
  } catch (err) {
    alert('刪除失敗')
  }
}

const formatDate = (d) => {
  if (!d) return ''
  return d.replace(/-/g, '/')
}

onMounted(() => {
  loadTrips()
  loadTodos()
})
</script>
