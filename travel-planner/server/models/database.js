/**
 * 資料庫模組
 * 使用 sql.js (純 JS SQLite，無需編譯)
 */

import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 資料庫檔案位置
const dbPath = join(__dirname, '..', 'database.sqlite')

// 資料庫實例
let db = null

/**
 * 儲存資料庫到檔案
 */
function saveDatabase() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    writeFileSync(dbPath, buffer)
  }
}

/**
 * 初始化資料庫
 */
export async function initDatabase() {
  const SQL = await initSqlJs()

  // 嘗試載入現有資料庫
  if (existsSync(dbPath)) {
    try {
      const fileBuffer = readFileSync(dbPath)
      db = new SQL.Database(fileBuffer)
      console.log('📂 載入現有資料庫')
    } catch (err) {
      console.log('📦 建立新資料庫')
      db = new SQL.Database()
    }
  } else {
    console.log('📦 建立新資料庫')
    db = new SQL.Database()
  }

  // 啟用外鍵約束
  db.run('PRAGMA foreign_keys = ON')

  // 建立表格
  createTables()

  // 儲存資料庫
  saveDatabase()

  console.log('📦 資料庫初始化完成')

  // 設定定期自動儲存（每 30 秒）
  setInterval(saveDatabase, 30000)

  return db
}

/**
 * 建立資料庫表格
 */
function createTables() {
  // 建立會員資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      familyName TEXT,
      telegramId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 如果 telegramId 欄位不存在就新增（相容舊資料庫）
  try {
    db.run('ALTER TABLE users ADD COLUMN telegramId TEXT')
  } catch (e) {
    // 欄位已存在，忽略
  }

  // 建立家族群組資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ownerId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ownerId) REFERENCES users(id)
    )
  `)

  // 建立家族成員資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      familyId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (familyId) REFERENCES families(id),
      FOREIGN KEY (userId) REFERENCES users(id),
      UNIQUE(familyId, userId)
    )
  `)

  // 建立行程資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      destination TEXT,
      startDate DATE,
      endDate DATE,
      status TEXT DEFAULT 'planning',
      familyName TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // 建立行程項目資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS trip_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      date DATE NOT NULL,
      time TEXT,
      title TEXT NOT NULL,
      location TEXT,
      notes TEXT,
      orderIndex INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    )
  `)

  // 建立住宿資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS accommodations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      checkIn DATE,
      checkOut DATE,
      pricePerNight REAL,
      currency TEXT DEFAULT 'JPY',
      rating INTEGER,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    )
  `)

  // 建立費用分攤資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'JPY',
      paidBy INTEGER,
      splitType TEXT DEFAULT 'equal',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (paidBy) REFERENCES users(id)
    )
  `)

  // 建立費用分攤明細資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS expense_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expenseId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      shareAmount REAL NOT NULL,
      isPaid INTEGER DEFAULT 0,
      FOREIGN KEY (expenseId) REFERENCES expenses(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // 建立待辦事項資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      dueDate DATE,
      isCompleted INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'normal',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // 建立留言板資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER,
      userId INTEGER NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)
}

/**
 * 取得資料庫實例
 */
export function getDb() {
  return db
}

/**
 * 儲存資料庫（外部呼叫）
 */
export { saveDatabase }

// ============================================
// 便利的查詢方法（模擬 better-sqlite3 API）
// ============================================

/**
 * 執行一條 SQL（無回傳）
 * sql.js 的 db.run() 需要接收 params 作為陣列
 */
export function run(sql, ...params) {
  db.run(sql, params[0] ?? [])
  saveDatabase()
}

/**
 * 取得一筆資料
 * sql.js 需要 params 作為陣列
 */
export function get(sql, ...params) {
  const stmt = db.prepare(sql)
  stmt.bind(params[0] ?? [])
  if (stmt.step()) {
    const row = stmt.getAsObject()
    stmt.free()
    return row
  }
  stmt.free()
  return undefined
}

/**
 * 取得所有資料
 * sql.js 需要 params 作為陣列
 */
export function all(sql, ...params) {
  const stmt = db.prepare(sql)
  stmt.bind(params[0] ?? [])
  const results = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

/**
 * 取得最後插入的 ID
 */
export function getLastInsertRowid() {
  const result = db.exec('SELECT last_insert_rowid() as id')
  return result[0]?.values[0]?.[0] || 0
}

export default {
  initDatabase,
  getDb,
  saveDatabase,
  run,
  get,
  all,
  getLastInsertRowid
}
