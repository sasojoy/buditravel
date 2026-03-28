/**
 * 行程路由模組
 * 處理行程的 CRUD 操作
 */

import express from 'express'
import db from '../models/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateToken)

// ============ 行程 CRUD ============

// GET /api/trips
router.get('/', (req, res) => {
  try {
    const trips = db.all(`SELECT * FROM trips ORDER BY createdAt DESC`)
    res.json(trips)
  } catch (err) {
    console.error('取得行程錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// GET /api/trips/:id
router.get('/:id', (req, res) => {
  try {
    const tripId = req.params.id

    const trip = db.get(`SELECT * FROM trips WHERE id = ? AND userId = ?`, [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    const items = db.all(`SELECT * FROM trip_items WHERE tripId = ? ORDER BY date ASC, orderIndex ASC`, [tripId])
    const accommodations = db.all(`SELECT * FROM accommodations WHERE tripId = ?`, [tripId])
    const expenses = db.all(`SELECT * FROM expenses WHERE tripId = ?`, [tripId])
    const messages = db.all(`SELECT m.*, u.username FROM messages m LEFT JOIN users u ON m.userId = u.id WHERE m.tripId = ? ORDER BY m.createdAt DESC`, [tripId])
    const todos = db.all(`SELECT * FROM todos WHERE tripId = ? ORDER BY isCompleted ASC, createdAt DESC`, [tripId])

    res.json({ ...trip, items, accommodations, expenses, messages, todos })
  } catch (err) {
    console.error('取得行程詳細錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// POST /api/trips
router.post('/', (req, res) => {
  try {
    const { name, destination, startDate, endDate, status, familyName, notes } = req.body

    if (!name) {
      return res.status(400).json({ message: '行程名稱為必填' })
    }

    db.run(`
      INSERT INTO trips (userId, name, destination, startDate, endDate, status, familyName, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, name, destination || null, startDate || null, endDate || null, status || 'planning', familyName || null, notes || null])

    const newId = db.getLastInsertRowid()
    const trip = db.get('SELECT * FROM trips WHERE id = ?', [newId])
    res.status(201).json(trip)
  } catch (err) {
    console.error('建立行程錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// PUT /api/trips/:id
router.put('/:id', (req, res) => {
  try {
    const tripId = req.params.id
    const { name, destination, startDate, endDate, status, familyName, notes } = req.body

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run(`
      UPDATE trips
      SET name = ?, destination = ?, startDate = ?, endDate = ?, status = ?, familyName = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name || trip.name, destination, startDate, endDate, status, familyName, notes, tripId])

    const updatedTrip = db.get('SELECT * FROM trips WHERE id = ?', [tripId])
    res.json(updatedTrip)
  } catch (err) {
    console.error('更新行程錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// DELETE /api/trips/:id
router.delete('/:id', (req, res) => {
  try {
    const tripId = req.params.id

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run('DELETE FROM trips WHERE id = ?', [tripId])
    res.json({ message: '行程已刪除' })
  } catch (err) {
    console.error('刪除行程錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// POST /api/trips/:id/copy
router.post('/:id/copy', (req, res) => {
  try {
    const originalTripId = req.params.id

    const originalTrip = db.get('SELECT * FROM trips WHERE id = ? AND userId = ?', [originalTripId, req.user.id])
    if (!originalTrip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run(`
      INSERT INTO trips (userId, name, destination, startDate, endDate, status, familyName, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, `${originalTrip.name} (副本)`, originalTrip.destination, originalTrip.startDate, originalTrip.endDate, 'planning', originalTrip.familyName, originalTrip.notes])

    const newTripId = db.getLastInsertRowid()

    const items = db.all('SELECT * FROM trip_items WHERE tripId = ?', [originalTripId])
    for (const item of items) {
      db.run(`INSERT INTO trip_items (tripId, date, time, title, location, notes, orderIndex) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newTripId, item.date, item.time, item.title, item.location, item.notes, item.orderIndex])
    }

    const accommodations = db.all('SELECT * FROM accommodations WHERE tripId = ?', [originalTripId])
    for (const acc of accommodations) {
      db.run(`INSERT INTO accommodations (tripId, name, address, checkIn, checkOut, pricePerNight, currency, rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newTripId, acc.name, acc.address, acc.checkIn, acc.checkOut, acc.pricePerNight, acc.currency, acc.rating, acc.notes])
    }

    const newTrip = db.get('SELECT * FROM trips WHERE id = ?', [newTripId])
    res.status(201).json(newTrip)
  } catch (err) {
    console.error('複製行程錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// ============ 行程項目 CRUD ============

// POST /api/trips/:id/items
router.post('/:id/items', (req, res) => {
  try {
    const tripId = req.params.id
    const { date, time, title, location, notes, orderIndex } = req.body

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run(`INSERT INTO trip_items (tripId, date, time, title, location, notes, orderIndex) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tripId, date, time, title, location, notes, orderIndex || 0])

    const itemId = db.getLastInsertRowid()
    const item = db.get('SELECT * FROM trip_items WHERE id = ?', [itemId])
    res.status(201).json(item)
  } catch (err) {
    console.error('新增行程項目錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// PUT /api/trips/:tripId/items/:itemId
router.put('/:tripId/items/:itemId', (req, res) => {
  try {
    const { tripId, itemId } = req.params
    const { date, time, title, location, notes, orderIndex } = req.body

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run(`UPDATE trip_items SET date = ?, time = ?, title = ?, location = ?, notes = ?, orderIndex = ? WHERE id = ? AND tripId = ?`,
      [date, time, title, location, notes, orderIndex, itemId, tripId])

    const item = db.get('SELECT * FROM trip_items WHERE id = ?', [itemId])
    res.json(item)
  } catch (err) {
    console.error('更新行程項目錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// DELETE /api/trips/:tripId/items/:itemId
router.delete('/:tripId/items/:itemId', (req, res) => {
  try {
    const { tripId, itemId } = req.params

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run('DELETE FROM trip_items WHERE id = ? AND tripId = ?', [itemId, tripId])
    res.json({ message: '項目已刪除' })
  } catch (err) {
    console.error('刪除行程項目錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// ============ 住宿 CRUD ============

// POST /api/trips/:id/accommodations
router.post('/:id/accommodations', (req, res) => {
  try {
    const tripId = req.params.id
    const { name, address, checkIn, checkOut, pricePerNight, currency, rating, notes } = req.body

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run(`INSERT INTO accommodations (tripId, name, address, checkIn, checkOut, pricePerNight, currency, rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tripId, name, address, checkIn, checkOut, pricePerNight, currency || 'JPY', rating, notes])

    const accId = db.getLastInsertRowid()
    const accommodation = db.get('SELECT * FROM accommodations WHERE id = ?', [accId])
    res.status(201).json(accommodation)
  } catch (err) {
    console.error('新增住宿錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// DELETE /api/trips/:tripId/accommodations/:accId
router.delete('/:tripId/accommodations/:accId', (req, res) => {
  try {
    const { tripId, accId } = req.params

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run('DELETE FROM accommodations WHERE id = ? AND tripId = ?', [accId, tripId])
    res.json({ message: '住宿已刪除' })
  } catch (err) {
    console.error('刪除住宿錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// ============ 留言板 ============

// GET /api/trips/:id/messages
router.get('/:id/messages', (req, res) => {
  try {
    const tripId = req.params.id

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    const messages = db.all(`
      SELECT m.*, u.username
      FROM messages m
      LEFT JOIN users u ON m.userId = u.id
      WHERE m.tripId = ?
      ORDER BY m.createdAt DESC
    `, [tripId])

    res.json(messages)
  } catch (err) {
    console.error('取得留言錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// POST /api/trips/:id/messages
router.post('/:id/messages', (req, res) => {
  try {
    const tripId = req.params.id
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ message: '留言內容為必填' })
    }

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run(`INSERT INTO messages (tripId, userId, content) VALUES (?, ?, ?)`, [tripId, req.user.id, content])

    const msgId = db.getLastInsertRowid()
    const message = db.get(`
      SELECT m.*, u.username
      FROM messages m
      LEFT JOIN users u ON m.userId = u.id
      WHERE m.id = ?
    `, [msgId])

    res.status(201).json(message)
  } catch (err) {
    console.error('新增留言錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// DELETE /api/trips/:tripId/messages/:msgId
router.delete('/:tripId/messages/:msgId', (req, res) => {
  try {
    const { tripId, msgId } = req.params

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run('DELETE FROM messages WHERE id = ? AND tripId = ?', [msgId, tripId])
    res.json({ message: '留言已刪除' })
  } catch (err) {
    console.error('刪除留言錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

export default router
