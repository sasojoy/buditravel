/**
 * 待辦事項路由模組
 * 待辦事項隸屬於行程（tripId）
 */

import express from 'express'
import db from '../models/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateToken)

// GET /api/todos — 取得待辦，可篩選 tripId
router.get('/', (req, res) => {
  try {
    const { tripId } = req.query
    let sql = `SELECT t.*, tr.name as tripName FROM todos t LEFT JOIN trips tr ON t.tripId = tr.id WHERE t.userId = ?`
    const params = [req.user.id]

    if (tripId) {
      sql += ` AND t.tripId = ?`
      params.push(tripId)
    }

    sql += ` ORDER BY t.isCompleted ASC, t.createdAt DESC`
    const todos = db.all(sql, ...params)
    res.json(todos)
  } catch (err) {
    console.error('取得待辦錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// POST /api/todos — 新增待辦
router.post('/', (req, res) => {
  try {
    const { title, dueDate, priority, tripId } = req.body
    if (!title) {
      return res.status(400).json({ message: '標題為必填' })
    }

    // 如果有 tripId，驗證行程存在且屬於該用戶
    if (tripId) {
      const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
      if (!trip) {
        return res.status(404).json({ message: '行程不存在' })
      }
    }

    db.run(
      `INSERT INTO todos (userId, tripId, title, dueDate, isCompleted, priority) VALUES (?, ?, ?, ?, 0, ?)`,
      [req.user.id, tripId || null, title, dueDate || null, priority || 'normal']
    )

    const newId = db.getLastInsertRowid()
    const todo = db.get(`
      SELECT t.*, tr.name as tripName
      FROM todos t
      LEFT JOIN trips tr ON t.tripId = tr.id
      WHERE t.id = ?
    `, [newId])
    res.status(201).json(todo)
  } catch (err) {
    console.error('新增待辦錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// PUT /api/todos/:id — 更新待辦
router.put('/:id', (req, res) => {
  try {
    const todoId = req.params.id
    const { title, dueDate, isCompleted, priority } = req.body

    const todo = db.get('SELECT * FROM todos WHERE id = ? AND userId = ?', [todoId, req.user.id])
    if (!todo) {
      return res.status(404).json({ message: '待辦事項不存在' })
    }

    const completedVal = isCompleted !== undefined ? (isCompleted ? 1 : 0) : todo.isCompleted

    db.run(
      `UPDATE todos SET title = ?, dueDate = ?, isCompleted = ?, priority = ? WHERE id = ?`,
      [title || todo.title, dueDate, completedVal, priority || todo.priority, todoId]
    )

    const updatedTodo = db.get(`
      SELECT t.*, tr.name as tripName
      FROM todos t
      LEFT JOIN trips tr ON t.tripId = tr.id
      WHERE t.id = ?
    `, [todoId])
    res.json(updatedTodo)
  } catch (err) {
    console.error('更新待辦錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// DELETE /api/todos/:id — 刪除待辦
router.delete('/:id', (req, res) => {
  try {
    const todoId = req.params.id

    const todo = db.get('SELECT * FROM todos WHERE id = ? AND userId = ?', [todoId, req.user.id])
    if (!todo) {
      return res.status(404).json({ message: '待辦事項不存在' })
    }

    db.run('DELETE FROM todos WHERE id = ?', [todoId])
    res.json({ message: '待辦事項已刪除' })
  } catch (err) {
    console.error('刪除待辦錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

export default router
