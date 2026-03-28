/**
 * 家族旅遊系統 - 後端主伺服器
 * 小c 开发
 */

import express from 'express'
import cors from 'cors'
import { initDatabase } from './models/database.js'

// 匯入路由
import authRoutes from './routes/auth.js'
import tripRoutes from './routes/trips.js'
import expenseRoutes from './routes/expenses.js'
import todoRoutes from './routes/todos.js'
import aiRoutes from './routes/ai.js'
import membersRoutes from './routes/members.js'

const app = express()
const PORT = process.env.PORT || 3000

// 中間件設定
app.use(cors())  // 允許跨域
app.use(express.json())  // 解析 JSON

// 初始化資料庫
await initDatabase()

// API 路由
app.use('/api/auth', authRoutes)      // 認證相關：登入、註冊
app.use('/api/trips', tripRoutes)     // 行程相關：CRUD
app.use('/api/expenses', expenseRoutes)  // 費用相關
app.use('/api/todos', todoRoutes)     // 待辦事項
app.use('/api/ai', aiRoutes)          // AI 專用接口（免登入）
app.use('/api/members', membersRoutes) // 成員查詢接口（AI 管家用）

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '家族旅遊系統運作中 🎿' })
})

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  🎿 家族旅遊系統伺服器啟動中...        ║
  ║  連接：http://localhost:${PORT}              ║
  ║  API：http://localhost:${PORT}/api           ║
  ╚════════════════════════════════════════╝
  `)
})
