/**
 * 認證路由模組
 * 處理會員註冊、登入等
 */

import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { get as dbGet, all as dbAll, run as dbRun, getLastInsertRowid } from '../models/database.js'
import { generateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, familyName } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: '請填寫所有必填欄位' })
    }

    const existingUser = dbGet('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser) {
      return res.status(400).json({ message: '此電子郵件已被註冊' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    dbRun(
      `INSERT INTO users (username, email, password, familyName) VALUES (?, ?, ?, ?)`,
      [username, email, hashedPassword, familyName || null]
    )

    const userId = getLastInsertRowid()

    if (familyName) {
      dbRun(`INSERT INTO families (name, ownerId) VALUES (?, ?)`, [familyName, userId])
      const familyId = getLastInsertRowid()
      dbRun(`INSERT INTO family_members (familyId, userId, role) VALUES (?, ?, 'owner')`, [familyId, userId])
    }

    const user = dbGet(`SELECT id, username, email, familyName, createdAt FROM users WHERE id = ?`, [userId])
    const token = generateToken(user)

    res.status(201).json({
      message: '註冊成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        familyName: user.familyName
      }
    })
  } catch (err) {
    console.error('註冊錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: '請填寫電子郵件和密碼' })
    }

    const user = dbGet(
      `SELECT id, username, email, password, familyName, createdAt FROM users WHERE email = ?`,
      [email]
    )

    if (!user) {
      return res.status(401).json({ message: '電子郵件或密碼錯誤' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: '電子郵件或密碼錯誤' })
    }

    const token = generateToken(user)

    res.json({
      message: '登入成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        familyName: user.familyName
      }
    })
  } catch (err) {
    console.error('登入錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
})

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: '未登入' })
    }

    const jwt = await import('jsonwebtoken')
    const { JWT_SECRET } = await import('../middleware/auth.js')
    const decoded = jwt.default.verify(token, JWT_SECRET)

    const user = dbGet(`SELECT id, username, email, familyName, createdAt FROM users WHERE id = ?`, [decoded.id])

    if (!user) {
      return res.status(404).json({ message: '會員不存在' })
    }

    res.json({ user })
  } catch (err) {
    console.error('取得會員資料錯誤:', err)
    res.status(401).json({ message: '請重新登入' })
  }
})

// 取得所有會員（身份列表）- 供登入頁面使用
router.get('/members', (req, res) => {
  try {
    const members = dbAll(`
      SELECT id, username, email, familyName, createdAt 
      FROM users 
      ORDER BY createdAt ASC
    `)
    // 過濾密碼欄位，並加上 emoji
    const safeMembers = members.map((m, i) => ({
      id: m.id,
      username: m.username,
      email: m.email,
      familyName: m.familyName,
      emoji: ['👤', '👩', '👨', '🧑', '👴', '👵', '🤴', '👸'][i % 8]
    }))
    res.json({ members: safeMembers })
  } catch (err) {
    console.error('取得會員列表錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// 手機版快速登入（用 member ID）
router.post('/quick-login', (req, res) => {
  try {
    const { memberId } = req.body
    if (!memberId) {
      return res.status(400).json({ message: '缺少 memberId' })
    }
    
    const member = dbGet('SELECT id, username, email, familyName FROM users WHERE id = ?', [memberId])
    if (!member) {
      return res.status(404).json({ message: '會員不存在' })
    }
    
    const token = jwt.sign(
      { id: member.id, email: member.email, username: member.username },
      'family-travel-secret-key-2024',
      { expiresIn: '7d' }
    )
    
    res.json({
      token,
      user: {
        id: member.id,
        username: member.username,
        email: member.email,
        familyName: member.familyName
      }
    })
  } catch (err) {
    console.error('快速登入錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

export default router
