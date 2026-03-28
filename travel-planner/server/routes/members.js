/**
 * 成員路由模組
 * 處理會員資料查詢（給 AI 管家用，無需完整登入）
 */

import express from 'express'
import { get as dbGet, all as dbAll, run as dbRun } from '../models/database.js'

const router = express.Router()

// GET /api/members/by-telegram/:telegramId
// 透過 Telegram ID 查詢會員（AI 管家驗證身份用）
router.get('/by-telegram/:telegramId', (req, res) => {
  try {
    const { telegramId } = req.params
    
    const member = dbGet(
      `SELECT id, username, email, familyName, telegramId FROM users WHERE telegramId = ?`,
      [telegramId]
    )
    
    if (!member) {
      return res.status(404).json({ message: '找不到這個 Telegram 對應的會員' })
    }
    
    res.json({
      id: member.id,
      name: member.username,
      email: member.email,
      familyName: member.familyName,
      telegramId: member.telegramId
    })
  } catch (err) {
    console.error('查詢會員錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// GET /api/members/by-id/:id
// 透過數字 ID 查詢會員（供 AI 管家建立行程用）
router.get('/by-id/:id', (req, res) => {
  try {
    const { id } = req.params
    
    const member = dbGet(
      `SELECT id, username, email, familyName, telegramId FROM users WHERE id = ?`,
      [id]
    )
    
    if (!member) {
      return res.status(404).json({ message: '會員不存在' })
    }
    
    res.json({
      id: member.id,
      name: member.username,
      email: member.email,
      familyName: member.familyName,
      telegramId: member.telegramId
    })
  } catch (err) {
    console.error('查詢會員錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// GET /api/members
// 取得所有成員列表（供 AI 管家規劃行程用）
router.get('/', (req, res) => {
  try {
    const members = dbAll(
      `SELECT id, username, email, familyName, telegramId FROM users ORDER BY id ASC`
    )
    
    res.json({
      members: members.map((m, i) => ({
        id: m.id,
        name: m.username,
        email: m.email,
        familyName: m.familyName,
        telegramId: m.telegramId,
        emoji: ['👤', '👩', '👨', '🧑', '👴', '👵', '🤴', '👸'][i % 8]
      }))
    })
  } catch (err) {
    console.error('取得成員列表錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// POST /api/members/:id/link-telegram
// 綁定 Telegram ID 到會員
router.post('/:id/link-telegram', (req, res) => {
  try {
    const { id } = req.params
    const { telegramId } = req.body
    
    if (!telegramId) {
      return res.status(400).json({ message: '缺少 telegramId' })
    }
    
    // 檢查會員是否存在
    const member = dbGet(`SELECT id, username FROM users WHERE id = ?`, [id])
    if (!member) {
      return res.status(404).json({ message: '會員不存在' })
    }
    
    // 檢查這個 telegramId 是否已經被其他會員使用
    const existing = dbGet(`SELECT id, username FROM users WHERE telegramId = ? AND id != ?`, [telegramId, id])
    if (existing) {
      return res.status(409).json({ message: `這個 Telegram 已經綁定到 ${existing.username}` })
    }
    
    // 更新綁定
    dbRun(`UPDATE users SET telegramId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [telegramId, id])
    
    res.json({ message: '綁定成功', memberId: id, telegramId })
  } catch (err) {
    console.error('綁定 Telegram 錯誤:', err)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

export default router
