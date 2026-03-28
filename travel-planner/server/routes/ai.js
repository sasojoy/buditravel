/**
 * AI 專用接口 - 免登入
 * 使用 API Key 驗證，專門給家族 AI 管家使用
 */

import express from 'express'
import db from '../models/database.js'

const router = express.Router()

// 簡單的 API Key 驗證（你們家內部使用，夠用就好）
const AI_API_KEY = process.env.AI_API_KEY || 'family-ai-secret-key-2024'

function verifyApiKey(req, res, next) {
  const key = req.headers['x-ai-api-key']
  if (!key || key !== AI_API_KEY) {
    return res.status(401).json({ message: 'AI API Key 無效' })
  }
  next()
}

router.use(verifyApiKey)

// ============ AI 快速新增行程 ============

/**
 * POST /api/ai/trips
 * AI 快速建立行程
 */
router.post('/trips', (req, res) => {
  try {
    const { name, destination, startDate, endDate, familyName, notes, createdBy } = req.body

    if (!name) {
      return res.status(400).json({ message: '行程名稱為必填' })
    }

    // 預設用 admin user (id=1) 或者用 createdBy 指定
    const userId = createdBy || 1

    db.run(`
      INSERT INTO trips (userId, name, destination, startDate, endDate, status, familyName, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, userId, name, destination || null, startDate || null, endDate || null, 'planning', familyName || null, notes || null)

    const tripId = db.getLastInsertRowid()
    const trip = db.get('SELECT * FROM trips WHERE id = ?', tripId)

    res.status(201).json({ success: true, trip })
  } catch (err) {
    console.error('AI 建立行程錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

/**
 * GET /api/ai/trips
 * AI 取得所有行程（用於查看）
 */
router.get('/trips', (req, res) => {
  try {
    const trips = db.all(`SELECT * FROM trips ORDER BY createdAt DESC`)
    res.json(trips)
  } catch (err) {
    console.error('AI 取得行程錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

/**
 * POST /api/ai/trips/:id/items
 * AI 新增行程項目
 */
router.post('/trips/:id/items', (req, res) => {
  try {
    const tripId = req.params.id
    const { date, time, title, location, notes, orderIndex } = req.body

    if (!title) {
      return res.status(400).json({ message: '項目標題為必填' })
    }

    db.run(`INSERT INTO trip_items (tripId, date, time, title, location, notes, orderIndex) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      tripId, date || null, time || null, title, location || null, notes || null, orderIndex || 0)

    const item = db.get('SELECT * FROM trip_items WHERE id = ?', db.getLastInsertRowid())
    res.status(201).json({ success: true, item })
  } catch (err) {
    console.error('AI 新增行程項目錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

/**
 * POST /api/ai/expenses
 * AI 新增費用
 */
router.post('/expenses', (req, res) => {
  try {
    const { tripId, description, amount, currency, paidBy } = req.body

    if (!tripId || !description || !amount) {
      return res.status(400).json({ message: '請填寫 tripId, description, amount' })
    }

    db.run(`
      INSERT INTO expenses (tripId, description, amount, currency, paidBy, splitType)
      VALUES (?, ?, ?, ?, ?, ?)
    `, tripId, description, amount, currency || 'JPY', paidBy || 1, 'equal')

    const expense = db.get('SELECT * FROM expenses WHERE id = ?', db.getLastInsertRowid())
    res.status(201).json({ success: true, expense })
  } catch (err) {
    console.error('AI 新增費用錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

/**
 * POST /api/ai/todos
 * AI 新增待辦事項
 */
router.post('/todos', (req, res) => {
  try {
    const { title, dueDate, priority, tripId } = req.body

    if (!title) {
      return res.status(400).json({ message: '標題為必填' })
    }

    db.run(
      `INSERT INTO todos (userId, tripId, title, dueDate, priority) VALUES (?, ?, ?, ?, ?)`,
      1, tripId || null, title, dueDate || null, priority || 'normal'
    )

    const todo = db.get('SELECT * FROM todos WHERE id = ?', db.getLastInsertRowid())
    res.status(201).json({ success: true, todo })
  } catch (err) {
    console.error('AI 新增待辦錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

/**
 * POST /api/ai/messages
 * AI 新增行程留言
 */
router.post('/messages', (req, res) => {
  try {
    const { tripId, content, userId } = req.body

    if (!tripId || !content) {
      return res.status(400).json({ message: 'tripId 和 content 為必填' })
    }

    db.run(`INSERT INTO messages (tripId, userId, content) VALUES (?, ?, ?)`,
      tripId, userId || 1, content)

    const message = db.get('SELECT * FROM messages WHERE id = ?', db.getLastInsertRowid())
    res.status(201).json({ success: true, message })
  } catch (err) {
    console.error('AI 新增留言錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

/**
 * GET /api/ai/trips/:id
 * AI 取得行程詳細
 */
router.get('/trips/:id', (req, res) => {
  try {
    const tripId = req.params.id
    const trip = db.get(`SELECT * FROM trips WHERE id = ?`, tripId)

    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    const items = db.all(`SELECT * FROM trip_items WHERE tripId = ? ORDER BY date ASC, orderIndex ASC`, tripId)
    const accommodations = db.all(`SELECT * FROM accommodations WHERE tripId = ?`, tripId)
    const expenses = db.all(`SELECT * FROM expenses WHERE tripId = ?`, tripId)
    const messages = db.all(`SELECT * FROM messages WHERE tripId = ? ORDER BY createdAt DESC`, tripId)

    res.json({ ...trip, items, accommodations, expenses, messages })
  } catch (err) {
    console.error('AI 取得行程詳細錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

export default router
