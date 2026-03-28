/**
 * JWT 認證中介軟體
 * 支援兩種模式：
 * 1. JWT Token 登入（一般用戶）
 * 2. X-Family-Member-Id（家族成員快速身份選擇）
 */

import jwt from 'jsonwebtoken'

// JWT 密鑰
const JWT_SECRET = process.env.JWT_SECRET || 'family-travel-secret-key-2024'

// AI 管家 API Key
const AI_API_KEY = process.env.AI_API_KEY || 'family-ai-secret-key-2024'

// 家族成員映射表
const FAMILY_MEMBERS = {
  1: { id: 1, username: 'Joy（老闆）', email: 'joy@family', isFamilyMember: true },
  2: { id: 2, username: 'Jasmine（老婆）', email: 'jasmine@family', isFamilyMember: true },
  3: { id: 3, username: 'Wang Bruce（哥哥）', email: 'bruce@family', isFamilyMember: true },
  4: { id: 4, username: 'JL（姑姑）', email: 'jl@family', isFamilyMember: true },
  5: { id: 5, username: 'JM（姑姑）', email: 'jm@family', isFamilyMember: true },
}

/**
 * 驗證身份
 */
export function authenticateToken(req, res, next) {
  // 檢查 API Key 模式（AI 管家）
  const apiKey = req.headers['x-ai-api-key']
  if (apiKey && apiKey === AI_API_KEY) {
    req.user = { id: 0, username: 'AI管家', isSystem: true, isAI: true }
    return next()
  }

  // 檢查家族成員快速身份（網頁前端）
  const familyMemberId = req.headers['x-family-member-id']
  if (familyMemberId && FAMILY_MEMBERS[familyMemberId]) {
    req.user = FAMILY_MEMBERS[familyMemberId]
    return next()
  }

  // 檢查 JWT Bearer Token
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: '請先登入或選擇身份' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ message: '登入已過期，請重新登入' })
  }
}

/**
 * 產生 JWT Token
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export { JWT_SECRET, FAMILY_MEMBERS }
