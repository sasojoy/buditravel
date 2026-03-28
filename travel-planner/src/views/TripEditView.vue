<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <button @click="router.back()" class="flex items-center text-gray-500 hover:text-orange-500 transition text-sm">
      <span class="mr-1">←</span> 返回
    </button>

    <div class="bg-white rounded-2xl shadow-warm p-6 md:p-8 border border-orange-50">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        {{ isEdit ? '✏️ 編輯行程' : '➕ 新建行程' }}
      </h1>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">行程名稱 <span class="text-red-400">*</span></label>
          <input v-model="form.name" type="text" required placeholder="例如：2025北海道滑雪之旅"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">目的地</label>
          <input v-model="form.destination" type="text" placeholder="例如：日本新潟縣苗場"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">出發日期</label>
            <input v-model="form.startDate" type="date"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">結束日期</label>
            <input v-model="form.endDate" type="date"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">狀態</label>
          <select v-model="form.status"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition">
            <option value="planning">📝 規劃中</option>
            <option value="confirmed">✅ 已確認</option>
            <option value="completed">🏁 已完成</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">家族名稱</label>
          <input v-model="form.familyName" type="text" placeholder="例如：黃家"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">備註</label>
          <textarea v-model="form.notes" rows="4" placeholder="其他注意事項..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition resize-none"></textarea>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{{ error }}</div>

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="router.back()"
            class="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm">取消</button>
          <button type="submit" :disabled="loading"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition text-sm">
            {{ loading ? '儲存中...' : (isEdit ? '儲存修改' : '建立行程') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTripStore } from '../stores/trip'

const router = useRouter()
const route = useRoute()
const tripStore = useTripStore()

const loading = ref(false)
const error = ref(null)
const isEdit = computed(() => !!route.params.id)

const form = ref({ name: '', destination: '', startDate: '', endDate: '', status: 'planning', familyName: '', notes: '' })

const loadTripData = async () => {
  if (route.params.id) {
    const result = await tripStore.fetchTrip(route.params.id)
    if (result.success) {
      const trip = tripStore.currentTrip
      form.value = { name: trip.name || '', destination: trip.destination || '', startDate: trip.startDate || '', endDate: trip.endDate || '', status: trip.status || 'planning', familyName: trip.familyName || '', notes: trip.notes || '' }
    }
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  try {
    let result
    if (isEdit.value) {
      result = await tripStore.updateTrip(route.params.id, form.value)
    } else {
      result = await tripStore.createTrip(form.value)
    }
    if (result.success) {
      router.push(`/trips/${result.data.id}`)
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = '儲存失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadTripData() })
</script>
