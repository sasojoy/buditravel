/**
 * 費用路由模組
 */

import express from 'express'
import db from '../models/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateToken)

router.get('/', (req, res) => {
  try {
    const expenses = db.all(`
      SELECT e.*, u.username as paidByName
      FROM expenses e
      LEFT JOIN users u ON e.paidBy = u.id
      ORDER BY e.createdAt DESC
    `)
    res.json(expenses)
  } catch (err) {
    console.error('取得費用錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

router.post('/', (req, res) => {
  try {
    const { tripId, description, amount, currency, splitType } = req.body

    if (!tripId || !description || !amount) {
      return res.status(400).json({ message: '請填寫所有必填欄位' })
    }

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    db.run(`
      INSERT INTO expenses (tripId, description, amount, currency, paidBy, splitType)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [tripId, description, amount, currency || 'JPY', req.user.id, splitType || 'equal'])

    const newId = db.getLastInsertRowid()
    const expense = db.get(`
      SELECT e.*, u.username as paidByName
      FROM expenses e
      LEFT JOIN users u ON e.paidBy = u.id
      WHERE e.id = ?
    `, [newId])

    res.status(201).json(expense)
  } catch (err) {
    console.error('新增費用錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

router.delete('/:id', (req, res) => {
  try {
    const expenseId = req.params.id

    const expense = db.get(`
      SELECT e.* FROM expenses e
      JOIN trips t ON e.tripId = t.id
      WHERE e.id = ? AND t.userId = ?
    `, [expenseId, req.user.id])

    if (!expense) {
      return res.status(404).json({ message: '費用不存在' })
    }

    db.run('DELETE FROM expenses WHERE id = ?', [expenseId])
    res.json({ message: '費用已刪除' })
  } catch (err) {
    console.error('刪除費用錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

router.get('/trip/:tripId', (req, res) => {
  try {
    const tripId = req.params.tripId

    const trip = db.get('SELECT id FROM trips WHERE id = ? AND userId = ?', [tripId, req.user.id])
    if (!trip) {
      return res.status(404).json({ message: '行程不存在' })
    }

    const expenses = db.all(`
      SELECT e.*, u.username as paidByName
      FROM expenses e
      LEFT JOIN users u ON e.paidBy = u.id
      WHERE e.tripId = ?
      ORDER BY e.createdAt DESC
    `, [tripId])

    res.json(expenses)
  } catch (err) {
    console.error('取得費用錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

export default router
