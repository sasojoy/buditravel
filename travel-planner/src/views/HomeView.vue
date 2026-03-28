<template>
  <div class="space-y-8">
    <!-- Hero 區塊 -->
    <section class="text-center py-10 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="inline-flex items-center px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-sm font-medium mb-6">
          <span class="mr-2">✨</span> 家族的每一次旅行，都值得被記錄
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
          輕鬆規劃<br class="md:hidden" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">家族旅遊行程</span>
        </h1>
        <p class="text-gray-500 text-lg mb-8">
          從滑雪到海灘，從城市探索到鄉村風情——記錄每個珍貴的家庭回憶
        </p>

        <div v-if="!authStore.isLoggedIn" class="flex flex-col sm:flex-row gap-3 justify-center">
          <router-link to="/register" class="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all">
            免費開始使用
          </router-link>
          <router-link to="/login" class="px-8 py-3 rounded-2xl bg-white text-gray-700 font-medium shadow-md hover:shadow-lg transition-all border border-gray-100">
            會員登入
          </router-link>
        </div>
      </div>

      <!-- 天氣小工具 -->
      <div class="max-w-sm mx-auto mt-8">
        <div v-if="!weatherLoaded" class="bg-white/60 backdrop-blur rounded-2xl p-4 border border-orange-100">
          <button
            @click="fetchQuickWeather"
            class="w-full text-center text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            🌤️ 查看湯沢天氣
          </button>
        </div>
        <div v-else class="bg-gradient-to-r from-orange-50 to-teal-50 rounded-2xl p-5 border border-orange-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-4xl mr-4">{{ quickWeather.emoji }}</span>
              <div class="text-left">
                <div class="text-2xl font-bold text-gray-800">{{ quickWeather.temp }}°C</div>
                <div class="text-sm text-gray-400">湯沢町</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-700">{{ quickWeather.desc }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ quickWeather.updated }}</div>
              <button @click="fetchQuickWeather" class="text-xs text-orange-500 hover:text-orange-600 mt-1">更新</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速功能入口 -->
    <section v-if="authStore.isLoggedIn" class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      <router-link
        v-for="item in quickActions"
        :key="item.path"
        :to="item.path"
        class="bg-white rounded-2xl p-5 shadow-warm hover:shadow-warm-lg transition-all border border-orange-50 group"
      >
        <div class="text-3xl mb-3">{{ item.emoji }}</div>
        <div class="font-bold text-gray-800 group-hover:text-orange-600 transition">{{ item.label }}</div>
        <div class="text-xs text-gray-400 mt-1">{{ item.sub }}</div>
      </router-link>
    </section>

    <!-- 滑雪專區預覽 -->
    <section class="bg-white rounded-3xl shadow-warm p-6 md:p-8 border border-orange-50">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800 flex items-center">
          <span class="text-2xl mr-2">⛷️</span>
          滑雪攻略
        </h2>
        <button
          v-if="authStore.isLoggedIn"
          @click="router.push('/ski')"
          class="text-sm text-orange-500 hover:text-orange-600 font-medium"
        >
          查看更多 →
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="ski in skiAreas"
          :key="ski.name"
          class="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 border border-blue-100 hover:border-blue-200 transition cursor-pointer"
          @click="goToSki"
        >
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-2">{{ ski.flag }}</span>
            <h3 class="font-bold text-gray-800">{{ ski.name }}</h3>
          </div>
          <p class="text-gray-500 text-sm mb-3">{{ ski.desc }}</p>
          <div class="text-xs text-gray-400 flex gap-3">
            <span>{{ ski.info }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特色 -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="feature in features" :key="feature.title" class="bg-white rounded-2xl p-5 shadow-warm border border-orange-50 hover:shadow-warm-lg transition-all">
        <div class="text-3xl mb-3">{{ feature.emoji }}</div>
        <h3 class="font-bold text-gray-800 mb-2">{{ feature.title }}</h3>
        <p class="text-sm text-gray-500">{{ feature.desc }}</p>
      </div>
    </section>

    <!-- 旅遊小知識 -->
    <section class="bg-white rounded-3xl shadow-warm p-6 md:p-8 border border-orange-50">
      <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span class="text-2xl mr-2">💡</span>
        旅遊小知識
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="tip in tips" :key="tip.title" class="bg-gradient-to-br rounded-2xl p-5" :class="tip.bg">
          <h3 class="font-bold text-gray-800 mb-2">{{ tip.title }}</h3>
          <p class="text-sm text-gray-600">{{ tip.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const weatherLoaded = ref(false)
const quickWeather = ref({ emoji: '☀️', temp: '--', desc: '晴朗', updated: '' })

const quickActions = [
  { path: '/trips', label: '我的行程', sub: '查看所有行程', emoji: '📋' },
  { path: '/ski', label: '滑雪攻略', sub: '日本雪場資訊', emoji: '⛷️' },
  { path: '/expenses', label: '費用分攤', sub: '輕鬆算帳', emoji: '💰' },
  { path: '/todo', label: '待辦事項', sub: '行前準備清單', emoji: '✅' },
]

const skiAreas = [
  { name: '苗場滑雪場', flag: '🇯🇵', desc: '日本最大級滑雪度假村，親子設施最多', info: '纜車8座 • 滑道15條' },
  { name: 'GALA湯澤', flag: '🇯🇵', desc: '新幹線直達，東京近郊最方便', info: '直達車站 • 3.5小時' },
  { name: '湯沢中里', flag: '🇯🇵', desc: 'CP值高，有魔毯適合初學者', info: '貓纜ski lift • 親子友善' },
]

const features = [
  { emoji: '📅', title: '行程管理', desc: '建立、編輯、複製行程，輕鬆管理旅遊計劃' },
  { emoji: '💰', title: '費用分攤', desc: '自動計算每人應付金額，解決結算煩惱' },
  { emoji: '🏨', title: '住宿收集', desc: '收集評比住宿資訊，找到最適合的選擇' },
  { emoji: '✅', title: '待辦清單', desc: '行前行中待辦事項，再也不遺漏' },
]

const tips = [
  { title: '🎿 第一次滑雪？', desc: '建議選擇緩坡為主的雪場，初學者先學會正確摔倒和起身，再練習剎車和轉彎。', bg: 'from-sky-50 to-blue-50' },
  { title: '⛷️ 滑雪穿著', desc: '洋蔥式穿法：底層排汗、中層保暖、外層防風防水。建議穿著專用滑雪襪。', bg: 'from-orange-50 to-amber-50' },
  { title: '🏨 預訂時機', desc: '日本滑雪區的飯店建議提前2-3個月預訂，聖誕節和新年期間尤其要早。', bg: 'from-teal-50 to-emerald-50' },
  { title: '🚄 交通建議', desc: 'GALA湯澤新幹線直達最方便，苗場最大最好玩。建議購買JR東京廣域周遊券。', bg: 'from-purple-50 to-violet-50' },
]

const fetchQuickWeather = async () => {
  try {
    const response = await fetch('https://wttr.in/Yuzawa,Niigata?format=j1')
    const data = await response.json()
    if (data.current_condition && data.current_condition[0]) {
      const c = data.current_condition[0]
      const code = parseInt(c.weatherCode)
      quickWeather.value = {
        emoji: getWeatherEmoji(code),
        temp: c.temp_C,
        desc: getWeatherDesc(code),
        updated: new Date().toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }
      weatherLoaded.value = true
    }
  } catch (err) {
    console.error('天氣取得失敗', err)
  }
}

const getWeatherEmoji = (code) => {
  const map = { 113: '☀️', 116: '⛅', 119: '☁️', 122: '☁️', 143: '🌫️', 176: '🌧️', 179: '🌨️', 200: '⛈️', 227: '🌨️', 230: '❄️', 263: '🌧️', 293: '🌧️', 296: '🌧️', 299: '🌧️', 302: '🌨️', 305: '🌧️', 308: '🌧️', 323: '🌨️', 326: '🌨️', 329: '❄️', 332: '❄️', 335: '❄️', 338: '❄️', 350: '🌨️', 353: '🌧️', 362: '🌨️', 371: '❄️', 377: '🌨️', 386: '⛈️', 395: '❄️' }
  return map[code] || '☀️'
}

const getWeatherDesc = (code) => {
  const map = { 113: '晴朗', 116: '多雲', 119: '陰天', 122: '陰天', 143: '有霧', 176: '局部陣雨', 179: '局部雪', 200: '雷暴', 227: '雪', 230: '暴風雪', 263: '小雨', 293: '小雨', 296: '中雨', 299: '大雨', 302: '大雪', 305: '雷陣雨', 308: '暴雨', 323: '小雪', 326: '小雪', 329: '大雪', 332: '大雪', 335: '暴風雪', 338: '極大雪', 350: '冰粒', 353: '小雨', 362: '小雪', 371: '大雪', 377: '冰粒', 386: '雷陣雨', 395: '大雪' }
  return map[code] || '未知'
}

const goToSki = () => {
  if (authStore.isLoggedIn) router.push('/ski')
  else router.push('/login')
}

onMounted(() => { fetchQuickWeather() })
</script>
