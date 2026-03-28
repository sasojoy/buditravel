<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">💰 費用分攤</h1>

    <!-- 說明卡片 -->
    <div class="bg-primary-50 border border-primary-200 rounded-xl p-4">
      <p class="text-primary-800 text-sm">
        💡 記錄旅行中的各項費用，系統會自動計算每人應分攤的金額，並顯示誰欠誰。
      </p>
    </div>

    <!-- 選擇行程 -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">選擇行程</label>
      <select
        v-model="selectedTripId"
        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
      >
        <option value="">請選擇行程</option>
        <option v-for="trip in tripStore.trips" :key="trip.id" :value="trip.id">
          {{ trip.name }}
        </option>
      </select>
    </div>

    <!-- 新增費用 -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <h2 class="text-lg font-bold text-gray-800 mb-4">➕ 新增費用</h2>
      <form @submit.prevent="addExpense" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">費用項目</label>
            <input
              v-model="newExpense.description"
              type="text"
              placeholder="例如：晚餐、纜車票"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">金額 (JPY)</label>
            <input
              v-model.number="newExpense.amount"
              type="number"
              placeholder="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">付款人</label>
            <select
              v-model="newExpense.paidBy"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">選擇付款人</option>
              <option v-for="member in familyMembers" :key="member" :value="member">{{ member }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分攤方式</label>
            <select
              v-model="newExpense.splitType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="equal">平均分攤</option>
              <option value="custom">自訂分攤</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          新增
        </button>
      </form>
    </div>

    <!-- 費用列表 -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <h2 class="text-lg font-bold text-gray-800 mb-4">📋 費用列表</h2>

      <div v-if="expenses.length > 0" class="space-y-3">
        <div
          v-for="expense in expenses"
          :key="expense.id"
          class="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <div class="font-medium text-gray-800">{{ expense.description }}</div>
            <div class="text-sm text-gray-500">
              付款人：{{ expense.paidByName || '未指定' }} |
              {{ expense.createdAt }}
            </div>
          </div>
          <div class="text-right">
            <div class="font-bold text-lg text-primary-600">¥{{ expense.amount.toLocaleString() }}</div>
            <button
              @click="deleteExpense(expense.id)"
              class="text-sm text-red-500 hover:text-red-700"
            >
              刪除
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-400">
        <p>還沒有費用記錄</p>
      </div>
    </div>

    <!-- 費用統計 -->
    <div v-if="expenses.length > 0" class="bg-white rounded-xl shadow-md p-6">
      <h2 class="text-lg font-bold text-gray-800 mb-4">📊 費用統計</h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-primary-50 rounded-lg p-4 text-center">
          <div class="text-sm text-gray-500">費用總計</div>
          <div class="text-2xl font-bold text-primary-600">¥{{ totalAmount.toLocaleString() }}</div>
        </div>
        <div class="bg-emerald-50 rounded-lg p-4 text-center">
          <div class="text-sm text-gray-500">平均每人</div>
          <div class="text-2xl font-bold text-emerald-600">¥{{ perPerson.toLocaleString() }}</div>
        </div>
        <div class="bg-amber-50 rounded-lg p-4 text-center">
          <div class="text-sm text-gray-500">付款筆數</div>
          <div class="text-2xl font-bold text-amber-600">{{ expenses.length }}</div>
        </div>
        <div class="bg-purple-50 rounded-lg p-4 text-center">
          <div class="text-sm text-gray-500">參與人數</div>
          <div class="text-2xl font-bold text-purple-600">{{ familyMembers.length || 2 }}</div>
        </div>
      </div>

      <!-- 結算結果 -->
      <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
        <h3 class="font-bold text-gray-800 mb-4">💵 結算建議</h3>

        <div v-if="settlement.length > 0" class="space-y-3">
          <div
            v-for="(item, idx) in settlement"
            :key="idx"
            class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
          >
            <div class="flex items-center">
              <span class="text-2xl mr-3">{{ item.emoji }}</span>
              <div>
                <div class="font-medium text-gray-800">{{ item.message }}</div>
                <div class="text-sm text-gray-500">{{ item.detail }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold" :class="item.amount > 0 ? 'text-emerald-600' : 'text-red-600'">
                {{ item.amount > 0 ? '+' : '' }}¥{{ Math.abs(item.amount).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-4 text-gray-500">
          <p>所有費用已結清 🎉</p>
        </div>

        <!-- 每人支出明細 -->
        <div class="mt-6">
          <h4 class="font-medium text-gray-800 mb-3">📝 每人支出明細</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="(data, member) in perMemberExpenses"
              :key="member"
              class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
            >
              <div>
                <span class="font-medium text-gray-800">{{ member }}</span>
                <span class="text-sm text-gray-400 ml-2">已付 ¥{{ data.paid.toLocaleString() }}</span>
              </div>
              <div class="text-right">
                <span class="text-sm text-gray-400">應付 </span>
                <span class="font-bold" :class="data.balance >= 0 ? 'text-emerald-600' : 'text-red-600'">
                  ¥{{ Math.abs(data.balance).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTripStore } from '../stores/trip'
import axios from 'axios'

const tripStore = useTripStore()

const selectedTripId = ref('')
const expenses = ref([])
const familyMembers = ref(['爸爸', '媽媽', '小孩1', '小孩2'])

const newExpense = ref({
  description: '',
  amount: 0,
  paidBy: '',
  splitType: 'equal'
})

const totalAmount = computed(() => {
  return expenses.value.reduce((sum, e) => sum + e.amount, 0)
})

const perPerson = computed(() => {
  const count = familyMembers.value.length || 2
  if (count <= 0) return 0
  return Math.round(totalAmount.value / count)
})

// 每人支出統計
const perMemberExpenses = computed(() => {
  const result = {}

  // 初始化成員
  familyMembers.value.forEach(member => {
    result[member] = { paid: 0, owes: 0, balance: 0 }
  })

  // 計算每人已付款
  expenses.value.forEach(expense => {
    const payer = expense.paidByName || expense.paidBy || familyMembers.value[0]
    if (result[payer]) {
      result[payer].paid += expense.amount
    }
  })

  // 計算每人應付（平均）
  const avg = perPerson.value
  for (const member in result) {
    result[member].owes = avg
    result[member].balance = result[member].paid - avg
  }

  return result
})

// 結算建議
const settlement = computed(() => {
  const members = []
  for (const [name, data] of Object.entries(perMemberExpenses.value)) {
    members.push({ name, balance: data.balance })
  }

  const results = []

  // 分離出欠錢的和被欠錢的
  const debtors = members.filter(m => m.balance < 0).sort((a, b) => a.balance - b.balance)
  const creditors = members.filter(m => m.balance > 0).sort((a, b) => b.balance - a.balance)

  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    const debtAmount = Math.abs(debtor.balance)
    const creditAmount = creditor.balance

    if (debtAmount <= 0 || creditAmount <= 0) break

    const transfer = Math.min(debtAmount, creditAmount)

    if (transfer > 0) {
      results.push({
        emoji: '➡️',
        message: `${debtor.name} 付給 ${creditor.name}`,
        detail: `¥${transfer.toLocaleString()} 達成結算`,
        amount: -transfer
      })

      debtor.balance += transfer
      creditor.balance -= transfer
    }

    if (Math.abs(debtor.balance) < 1) i++
    if (creditor.balance < 1) j++
  }

  return results
})

const addExpense = async () => {
  if (!selectedTripId.value || !newExpense.value.description || !newExpense.value.amount) {
    alert('請填寫完整資訊')
    return
  }

  try {
    const response = await axios.post(`/api/expenses`, {
      tripId: selectedTripId.value,
      description: newExpense.value.description,
      amount: newExpense.value.amount,
      paidBy: newExpense.value.paidBy || familyMembers.value[0],
      splitType: newExpense.value.splitType
    })
    expenses.value.push(response.data)
    newExpense.value = { description: '', amount: 0, paidBy: '', splitType: 'equal' }
  } catch (err) {
    alert('新增失敗')
  }
}

const deleteExpense = async (id) => {
  if (!confirm('確定要刪除這筆費用嗎？')) return

  try {
    await axios.delete(`/api/expenses/${id}`)
    expenses.value = expenses.value.filter(e => e.id !== id)
  } catch (err) {
    alert('刪除失敗')
  }
}

const loadExpenses = async () => {
  if (!selectedTripId.value) {
    expenses.value = []
    return
  }

  try {
    const response = await axios.get(`/api/trips/${selectedTripId.value}`)
    expenses.value = response.data.expenses || []
  } catch (err) {
    console.error('載入費用失敗', err)
  }
}

onMounted(() => {
  tripStore.fetchTrips()
})

watch(selectedTripId, loadExpenses)
</script>
