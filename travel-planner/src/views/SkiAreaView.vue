<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">🎿 滑雪專區</h1>

    <!-- 滑雪場選擇 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="ski in skiAreas"
        :key="ski.id"
        @click="selectedSki = ski"
        :class="[
          'bg-white rounded-xl shadow-md p-5 cursor-pointer transition hover:shadow-lg',
          selectedSki?.id === ski.id ? 'ring-2 ring-primary-500' : ''
        ]"
      >
        <div class="flex items-center mb-3">
          <span class="text-2xl mr-2">{{ ski.flag }}</span>
          <h3 class="font-bold text-lg">{{ ski.name }}</h3>
        </div>
        <p class="text-gray-600 text-sm">{{ ski.shortDesc }}</p>
        <div class="mt-3 text-xs text-gray-400">
          {{ ski.difficulty }}
        </div>
      </div>
    </div>

    <!-- 詳細資訊 -->
    <div v-if="selectedSki" class="bg-white rounded-xl shadow-md p-6">
      <div class="flex items-center mb-6">
        <span class="text-4xl mr-3">{{ selectedSki.flag }}</span>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ selectedSki.name }}</h2>
          <p class="text-gray-500">{{ selectedSki.location }}</p>
        </div>
      </div>

      <!-- 基本資訊 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="text-2xl mb-1">🎢</div>
          <div class="text-xs text-gray-500">纜車數量</div>
          <div class="font-bold text-gray-800">{{ selectedSki.lifts }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="text-2xl mb-1">⛷️</div>
          <div class="text-xs text-gray-500">滑道數量</div>
          <div class="font-bold text-gray-800">{{ selectedSki.courses }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="text-2xl mb-1">📏</div>
          <div class="text-xs text-gray-500">最長滑道</div>
          <div class="font-bold text-gray-800">{{ selectedSki.longestRun }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="text-2xl mb-1">⛰️</div>
          <div class="text-xs text-gray-500">雪場面積</div>
          <div class="font-bold text-gray-800">{{ selectedSki.area }}</div>
        </div>
      </div>

      <!-- 詳細描述 -->
      <div class="mb-6">
        <h3 class="font-bold text-gray-800 mb-2">簡介</h3>
        <p class="text-gray-600">{{ selectedSki.description }}</p>
      </div>

      <!-- 特色 -->
      <div class="mb-6">
        <h3 class="font-bold text-gray-800 mb-2">特色</h3>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <li
            v-for="feature in selectedSki.features"
            :key="feature"
            class="flex items-center text-gray-600 text-sm"
          >
            <span class="text-primary-500 mr-2">✓</span>
            {{ feature }}
          </li>
        </ul>
      </div>

      <!-- 適合程度 -->
      <div class="mb-6">
        <h3 class="font-bold text-gray-800 mb-2">適合程度</h3>
        <div class="flex items-center space-x-2">
          <span
            v-for="n in 5"
            :key="n"
            :class="[
              'w-8 h-2 rounded-full',
              n <= selectedSki.skillLevel ? 'bg-primary-500' : 'bg-gray-200'
            ]"
          ></span>
          <span class="text-sm text-gray-600 ml-2">{{ selectedSki.skillLabel }}</span>
        </div>
      </div>

      <!-- 交通資訊 -->
      <div class="mb-6">
        <h3 class="font-bold text-gray-800 mb-2">🚄 交通方式</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-gray-600 text-sm">{{ selectedSki.transportation }}</p>
        </div>
      </div>

      <!-- 家旅建議 -->
      <div class="bg-primary-50 rounded-lg p-4">
        <h3 class="font-bold text-primary-800 mb-2">👨‍👩‍👧‍👦 家庭旅遊建議</h3>
        <p class="text-primary-700 text-sm">{{ selectedSki.familyTip }}</p>
      </div>
    </div>

    <!-- ============ 住宿比較（新增別墅選項）============ -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-2">🏨 住宿比較</h2>
      <p class="text-sm text-gray-500 mb-4">滑雪場周邊住宿推薦，含飯店、滑雪直結、包棟別墅</p>

      <!-- 住宿類型篩選 -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="type in accommodationTypes"
          :key="type.value"
          @click="selectedAccommodationType = type.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition',
            selectedAccommodationType === type.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ type.label }}
        </button>
      </div>

      <!-- 住宿卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="acc in filteredAccommodations"
          :key="acc.id"
          class="border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition cursor-pointer"
          @click="selectedAccommodation = acc"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <span class="text-xs px-2 py-0.5 rounded bg-primary-100 text-primary-700">{{ acc.typeLabel }}</span>
            </div>
            <div v-if="acc.rating" class="flex items-center">
              <span class="text-amber-500">⭐</span>
              <span class="text-sm font-medium ml-1">{{ acc.rating }}</span>
            </div>
          </div>
          <h3 class="font-bold text-gray-800 mb-1">{{ acc.name }}</h3>
          <p class="text-sm text-gray-500 mb-3">{{ acc.skiArea }}</p>
          <div class="flex items-center justify-between">
            <div>
              <span class="text-lg font-bold text-primary-600">{{ acc.priceRange }}</span>
              <span class="text-xs text-gray-400">/晚</span>
            </div>
            <span class="text-xs text-gray-400">{{ acc.distance }}</span>
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="tag in acc.highlights"
              :key="tag"
              class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 住宿詳情彈窗 -->
      <div v-if="selectedAccommodation" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="selectedAccommodation = null">
        <div class="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <span class="text-xs px-2 py-0.5 rounded bg-primary-100 text-primary-700">{{ selectedAccommodation.typeLabel }}</span>
              <h3 class="text-xl font-bold text-gray-800 mt-2">{{ selectedAccommodation.name }}</h3>
              <p class="text-gray-500 text-sm">{{ selectedAccommodation.skiArea }}</p>
            </div>
            <button @click="selectedAccommodation = null" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-3 text-center">
                <div class="text-xs text-gray-500">參考價位</div>
                <div class="font-bold text-primary-600">{{ selectedAccommodation.priceRange }}</div>
                <div class="text-xs text-gray-400">/晚</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 text-center">
                <div class="text-xs text-gray-500">雪場距離</div>
                <div class="font-bold text-gray-800">{{ selectedAccommodation.distance }}</div>
              </div>
            </div>

            <div>
              <h4 class="font-medium text-gray-800 mb-2">特色</h4>
              <ul class="space-y-1">
                <li v-for="f in selectedAccommodation.features" :key="f" class="flex items-center text-sm text-gray-600">
                  <span class="text-primary-500 mr-2">✓</span> {{ f }}
                </li>
              </ul>
            </div>

            <div>
              <h4 class="font-medium text-gray-800 mb-2">適合族群</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in selectedAccommodation.suitableFor"
                  :key="tag"
                  class="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div>
              <h4 class="font-medium text-gray-800 mb-2">CP值分析</h4>
              <p class="text-sm text-gray-600">{{ selectedAccommodation.cpAnalysis }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 天氣預報（湯澤地區） -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">🌤️ 湯沢地區天氣預報</h2>
        <button
          @click="fetchWeather"
          :disabled="loadingWeather"
          class="text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
        >
          {{ loadingWeather ? '載入中...' : '🔄 更新' }}
        </button>
      </div>

      <div v-if="weatherError" class="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
        ⚠️ 無法取得天氣資訊，請稍後再試
      </div>

      <div v-else-if="weatherData" class="space-y-4">
        <!-- 目前天氣 -->
        <div class="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-3xl">{{ weatherData.current?.weather_emoji || '☀️' }}</div>
              <div class="text-lg font-bold text-gray-800">{{ weatherData.current?.temp || '--' }}°C</div>
              <div class="text-sm text-gray-600">{{ weatherData.current?.description || '晴朗' }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">湯沢町</div>
              <div class="text-sm text-gray-400">{{ weatherData.lastUpdated }}</div>
            </div>
          </div>
        </div>

        <!-- 一週預報 -->
        <div class="grid grid-cols-4 md:grid-cols-7 gap-2">
          <div
            v-for="day in weatherData.forecast"
            :key="day.date"
            class="text-center p-2 rounded-lg"
            :class="day.isToday ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'"
          >
            <div class="text-xs text-gray-500">{{ day.dayName }}</div>
            <div class="text-xl my-1">{{ day.weather }}</div>
            <div class="text-sm font-medium">{{ day.high }}°</div>
            <div class="text-xs text-gray-400">{{ day.low }}°</div>
          </div>
        </div>

        <!-- 滑雪建議 -->
        <div class="bg-blue-50 rounded-lg p-4">
          <h4 class="font-medium text-blue-800 mb-2">🎿 滑雪天氣建議</h4>
          <p class="text-sm text-blue-700">{{ weatherData.skiAdvice }}</p>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-400">
        <p>按下「更新」取得天氣資訊</p>
      </div>
    </div>

    <!-- 比較表格 -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">📊 三雪場比較</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-2">項目</th>
              <th class="text-center py-3 px-2">苗場</th>
              <th class="text-center py-3 px-2">GALA湯澤</th>
              <th class="text-center py-3 px-2">湯沢中里</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="py-3 px-2 font-medium">適合程度</td>
              <td class="text-center py-3 px-2">⭐⭐⭐⭐ 初學~進階</td>
              <td class="text-center py-3 px-2">⭐⭐⭐ 初學者</td>
              <td class="text-center py-3 px-2">⭐⭐⭐⭐ 親子/初學</td>
            </tr>
            <tr class="border-b">
              <td class="py-3 px-2 font-medium">交通時間</td>
              <td class="text-center py-3 px-2">東京出發約3.5h</td>
              <td class="text-center py-3 px-2">東京出發約1.5h</td>
              <td class="text-center py-3 px-2">東京出發約2h</td>
            </tr>
            <tr class="border-b">
              <td class="py-3 px-2 font-medium">雪道數</td>
              <td class="text-center py-3 px-2">15條</td>
              <td class="text-center py-3 px-2">16條</td>
              <td class="text-center py-3 px-2">10條</td>
            </tr>
            <tr class="border-b">
              <td class="py-3 px-2 font-medium">纜車數</td>
              <td class="text-center py-3 px-2">8台</td>
              <td class="text-center py-3 px-2">7台</td>
              <td class="text-center py-3 px-2">5台</td>
            </tr>
            <tr class="border-b">
              <td class="py-3 px-2 font-medium">CP值</td>
              <td class="text-center py-3 px-2">⭐⭐⭐⭐</td>
              <td class="text-center py-3 px-2">⭐⭐⭐</td>
              <td class="text-center py-3 px-2">⭐⭐⭐⭐⭐</td>
            </tr>
            <tr>
              <td class="py-3 px-2 font-medium">特色</td>
              <td class="text-center py-3 px-2">最大規模<br/>王子飯店直通</td>
              <td class="text-center py-3 px-2">新幹線直達<br/>適合一日遊</td>
              <td class="text-center py-3 px-2">貓纜ski lift<br/>平價友善</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const selectedSki = ref(null)
const selectedAccommodationType = ref('all')
const selectedAccommodation = ref(null)
const loadingWeather = ref(false)
const weatherData = ref(null)
const weatherError = ref(false)

const accommodationTypes = [
  { label: '全部', value: 'all' },
  { label: '🏨 飯店', value: 'hotel' },
  { label: '🎿 Ski-in/out', value: 'ski-in-out' },
  { label: '🏡 包棟別墅', value: 'villa' }
]

// 包棟別墅住宿資料
const accommodations = [
  // 苗場周邊
  {
    id: 'naeba-prince-villa',
    name: '苗場王子大飯店別墅區',
    type: 'ski-in-out',
    typeLabel: 'Ski-in/out',
    skiArea: '苗場滑雪場',
    priceRange: '¥25,000~45,000',
    distance: '直通雪場',
    rating: 4.5,
    highlights: ['直通纜車', '兒童友善', '溫泉'],
    features: [
      '與苗場滑雪場直通，ski-in/ski-out',
      '別墅型房型，客廳、廚房、臥室分開',
      '適合家庭4-8人',
      '免費接駁至越後湯沢站',
      '館內天然溫泉'
    ],
    suitableFor: ['家庭出遊', '多組家庭', '滑雪愛好者'],
    cpAnalysis: '雖然價格較高，但位置無敵，早去晚滑超方便，適合認真滑雪的家庭。'
  },
  {
    id: 'naeba-matsuda',
    name: '松田別莊',
    type: 'villa',
    typeLabel: '包棟別墅',
    skiArea: '苗場滑雪場（車程15分）',
    priceRange: '¥18,000~32,000',
    distance: '車程15分',
    rating: 4.7,
    highlights: ['包棟', '廚房', 'CP值高'],
    features: [
      '獨立包棟，隱私性佳',
      '完整廚房設備，可自煮',
      '最多可住10人',
      '價格實惠，人均¥2,000~4,000',
      '有烤肉設備'
    ],
    suitableFor: ['大家庭', '自炊族', '想省錢'],
    cpAnalysis: 'CP值最高！包棟別墅讓全家住得舒適又省錢，自己煮飯更有旅行感。'
  },
  {
    id: 'echigo-shirone',
    name: '越後白根別墅',
    type: 'villa',
    typeLabel: '包棟別墅',
    skiArea: '苗場滑雪場（車程20分）',
    priceRange: '¥15,000~28,000',
    distance: '車程20分',
    rating: 4.3,
    highlights: ['包棟', '自然環境', '安靜'],
    features: [
      '被大自然包圍，環境清幽',
      '木質裝潢，溫馨舒適',
      '適合8-12人大團體',
      '花園庭院，冬天可賞雪',
      '附近有超市'
    ],
    suitableFor: ['大團體', '放鬆度假', '自駕族群'],
    cpAnalysis: '適合自駕、想遠離喧囂的家庭，自然環境佳，但需要開車往返雪場。'
  },
  // GALA湯澤周邊
  {
    id: 'gala-central',
    name: 'GALA湯澤中央飯店',
    type: 'ski-in-out',
    typeLabel: 'Ski-in/out',
    skiArea: 'GALA湯澤滑雪場',
    priceRange: '¥20,000~35,000',
    distance: '徒步3分',
    rating: 4.4,
    highlights: ['近車站', '近雪場', '車站直結'],
    features: [
      '與GALA湯澤站徒步3分',
      'ski-in體驗（需走一小段）',
      '車站共構，商場便利',
      '租借裝備方便',
      '適合一日來回'
    ],
    suitableFor: ['新手滑雪', '一日遊', '交通導向'],
    cpAnalysis: '交通超方便，新幹線直達，但住宿價格偏高，適合時間有限的滑雪體驗。'
  },
  {
    id: 'gala-villa-izumi',
    name: '和泉山莊',
    type: 'villa',
    typeLabel: '包棟別墅',
    skiArea: 'GALA湯澤（車程10分）',
    priceRange: '¥12,000~22,000',
    distance: '車程10分',
    rating: 4.6,
    highlights: ['包棟', '溫泉', '清靜'],
    features: [
      '私人包棟，環境清幽',
      '室內外溫泉',
      '完整廚房',
      '最多8人',
      'CP值佳'
    ],
    suitableFor: ['家庭出遊', '溫泉愛好者', '深度遊'],
    cpAnalysis: '距離雪場不遠，價格實惠，私人溫泉是亮點，適合想放慢腳步的家庭。'
  },
  // 湯沢中里周邊
  {
    id: 'yunzako-nakazato-hotel',
    name: '湯沢中里飯店',
    type: 'ski-in-out',
    typeLabel: 'Ski-in/out',
    skiArea: '湯沢中里滑雪場',
    priceRange: '¥15,000~25,000',
    distance: '直通雪場',
    rating: 4.2,
    highlights: ['直通貓纜', '平價', '親子友善'],
    features: [
      '與湯沢中里雪場直結',
      '就在貓纜旁邊',
      '價格實惠',
      '餐廳、賣店齊全',
      '租借裝備便宜'
    ],
    suitableFor: ['親子滑雪', '初學者', '省錢'],
    cpAnalysis: 'CP值最高的滑雪直結飯店！貓纜就在旁邊，小孩玩雪超開心。'
  },
  {
    id: 'yunzako-villa-sakura',
    name: ' Sakura別莊',
    type: 'villa',
    typeLabel: '包棟別墅',
    skiArea: '湯沢中里（車程8分）',
    priceRange: '¥10,000~20,000',
    distance: '車程8分',
    rating: 4.5,
    highlights: ['包棟', '新裝潢', '便宜'],
    features: [
      '2023年重新裝潢',
      '現代化設備',
      '可住6-8人',
      '車程8分到雪場',
      '價格最實惠的包棟'
    ],
    suitableFor: ['小家庭', '預算優先', '第一次別墅'],
    cpAnalysis: '新裝潢、價格實惠，CP值之王！適合想體驗包棟別墅但預算有限的家庭。'
  }
]

const filteredAccommodations = computed(() => {
  if (selectedAccommodationType.value === 'all') return accommodations
  return accommodations.filter(a => a.type === selectedAccommodationType.value)
})

// 天氣查詢
const fetchWeather = async () => {
  loadingWeather.value = true
  weatherError.value = false

  try {
    // 使用 wttr.in 取得湯沢天氣（免費、無需 API key）
    const response = await fetch('https://wttr.in/Yuzawa,Niigata?format=j1')
    const data = await response.json()

    if (data.current_condition && data.weather) {
      const current = data.current_condition[0]
      const today = data.weather[0]

      // 解析天氣圖示
      const weatherCode = parseInt(current.weatherCode)
      const weatherEmoji = getWeatherEmoji(weatherCode)
      const weatherDesc = getWeatherDesc(weatherCode)

      // 一週預報
      const forecast = data.weather.slice(0, 7).map((day, idx) => {
        const date = new Date()
        date.setDate(date.getDate() + idx)
        return {
          date: day.date,
          dayName: idx === 0 ? '今天' : idx === 1 ? '明天' : ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][date.getDay()],
          weather: getWeatherEmoji(parseInt(day.hourly[4].weatherCode)),
          high: day.maxtempC,
          low: day.mintempC,
          isToday: idx === 0
        }
      })

      weatherData.value = {
        current: {
          temp: current.temp_C,
          description: weatherDesc,
          weather_emoji: weatherEmoji
        },
        forecast: forecast,
        lastUpdated: new Date().toLocaleString('zh-TW'),
        skiAdvice: generateSkiAdvice(current, data.weather[0])
      }
    }
  } catch (err) {
    console.error('天氣取得失敗:', err)
    weatherError.value = true
  } finally {
    loadingWeather.value = false
  }
}

const getWeatherEmoji = (code) => {
  const map = {
    113: '☀️', 116: '⛅', 119: '☁️', 122: '☁️',
    143: '🌫️', 176: '🌧️', 179: '🌨️', 182: '🌨️', 185: '🌨️',
    200: '⛈️', 227: '🌨️', 230: '❄️',
    248: '🌫️', 260: '🌫️', 263: '🌧️', 266: '🌧️', 281: '🌨️',
    293: '🌧️', 296: '🌧️', 299: '🌧️', 302: '🌨️', 305: '🌧️',
    308: '🌧️', 311: '🌨️', 314: '🌨️', 317: '🌨️', 320: '🌨️',
    323: '🌨️', 326: '🌨️', 329: '❄️', 332: '❄️', 335: '❄️',
    338: '❄️', 350: '🌨️', 353: '🌧️', 356: '🌧️', 359: '🌧️',
    362: '🌨️', 365: '🌨️', 368: '🌨️', 371: '❄️', 374: '🌨️',
    377: '🌨️', 386: '⛈️', 389: '⛈️', 392: '⛈️', 395: '❄️'
  }
  return map[code] || '☀️'
}

const getWeatherDesc = (code) => {
  const map = {
    113: '晴朗', 116: '多雲', 119: '陰天', 122: '陰天',
    143: '有霧', 176: '局部陣雨', 179: '局部雪', 182: '陣雪',
    185: '凍雨', 200: '雷暴', 227: '雪', 230: '暴風雪',
    263: '小雨', 266: '毛毛雨', 281: '凍雨', 293: '小雨',
    296: '中雨', 299: '大雨', 302: '大雪', 305: '雷陣雨',
    308: '暴雨', 311: '凍雨', 314: '凍雨', 317: '凍雨',
    320: '大雪', 323: '小雪', 326: '小雪', 329: '大雪',
    332: '大雪', 335: '暴風雪', 338: '極大雪', 350: '冰粒',
    353: '小雨', 356: '大雨', 359: '大雷雨', 362: '小雪',
    365: '中雪', 368: '小雪', 371: '大雪', 374: '冰粒',
    377: '冰粒', 386: '雷陣雨', 389: '雷暴雨', 392: '陣雪', 395: '大雪'
  }
  return map[code] || '未知'
}

const generateSkiAdvice = (current, today) => {
  const temp = parseInt(current.temp_C)
  const snow = today.hourly[4].snowCm || '0'

  if (temp < -10) return '❄️ 天氣極冷！建議穿著多層保暖衣物，每30分鐘進室內暖暖身體，注意手腳保暖。'
  if (temp < -5 && parseFloat(snow) > 0) return '🎿 天氣佳！新雪品質好，適合粉雪滑雪，但要注意保暖和雪崩風險。'
  if (temp < 0) return '⛷️ 天氣涼爽舒適，是滑雪的最佳時機！積雪狀況良好，好好享受滑雪吧！'
  if (temp < 5) return '🌤️ 氣溫適中，雪況可能略濕，建議上午滑雪，午後雪可能變軟。'
  return '☀️ 氣溫較高，雪可能較濕，建議早點出門滑雪，注意補水防曬。'
}

const skiAreas = [
  {
    id: 'naeba',
    name: '苗場滑雪場',
    flag: '🇯🇵',
    shortDesc: '日本超人氣雪場，適合親子同樂',
    location: '新潟縣南魚沼郡湯沢町',
    lifts: '8座',
    courses: '15條',
    longestRun: '4,000m',
    area: '293公頃',
    difficulty: '⭐⭐⭐⭐ 初學~進階',
    skillLevel: 4,
    skillLabel: '初學~進階適用',
    description: '苗場滑雪場是日本最具規模的滑雪度假區之一，與王子大飯店相連，適合家庭出遊。雪場面積廣大，擁有多樣化的雪道，從初學者到進階者都能找到適合的滑道。',
    features: [
      '與苗場王子大飯店直通',
      '雪季時間：12月中旬～3月下旬',
      '設有兒童滑雪學校',
      '豐富的餐飲與購物設施',
      '夜間營業至晚上10點'
    ],
    transportation: '從東京搭乘上越新幹線至越後湯沢站，轉乘免費接駁巴士約40分鐘。',
    familyTip: '推薦入住苗場王子大飯店，可以ski-in/ski-out，孩子們可以參加兒童滑雪學校，大人可以盡情滑雪。'
  },
  {
    id: 'gala',
    name: 'GALA湯澤滑雪場',
    flag: '🇯🇵',
    shortDesc: '新幹線直達，最適合一日來回',
    location: '新潟縣南魚沼郡湯沢町',
    lifts: '7座',
    courses: '16條',
    longestRun: '2,500m',
    area: '169公頃',
    difficulty: '⭐⭐⭐ 初學者',
    skillLevel: 3,
    skillLabel: '適合初學者',
    description: 'GALA湯澤最大的優勢是與上越新幹線GALA湯澤站共構，從東京車站搭乘新幹線直達，車程僅需75分鐘，是最適合一日來回的滑雪場。',
    features: [
      '新幹線直達超方便',
      '東京出發只要75分鐘',
      '雪季時間：12月中旬～5月上旬',
      '擁有室內暖氣設施',
      '租借装备完善'
    ],
    transportation: '從東京車站搭乘上越新幹線至GALA湯澤站（直達），車程約75分鐘。',
    familyTip: '非常適合時間有限的親子家庭，當天來回也OK！建議一大早出發，可以滑一整天。記得提前預訂纜車票。'
  },
  {
    id: 'yunzao',
    name: '湯沢中里滑雪場',
    flag: '🇯🇵',
    shortDesc: 'CP值最高，貓纜ski lift適合親子',
    location: '新潟縣南魚沼郡湯沢町',
    lifts: '5座（含貓纜）',
    courses: '10條',
    longestRun: '1,800m',
    area: '80公頃',
    difficulty: '⭐⭐⭐⭐ 親子/初學',
    skillLevel: 4,
    skillLabel: '非常適合親子',
    description: '湯沢中里以高CP值著稱，擁有可愛的貓咪造型纜車（cat lift），非常適合帶小朋友體驗滑雪。雪道以緩坡為主，是親子滑雪的首選。',
    features: [
      'Cat Lift（貓纜）超可愛',
      '物價相對便宜',
      '雪季時間：12月中旬～3月下旬',
      '有多條緩坡適合初學者',
      'ski school 價格實惠'
    ],
    transportation: '從東京搭乘上越新幹線至越後湯沢站，轉乘接駁巴士約15分鐘。',
    familyTip: '如果帶小孩第一次滑雪，湯沢中里是最佳選擇！貓纜很好玩，孩子會愛上這裡。費用比其他雪場便宜許多。'
  }
]

// 預設選擇第一個
selectedSki.value = skiAreas[0]
</script>
