# 🎿 家族旅遊行程規劃系統

一個專為家族設計的旅遊行程規劃系統，包含滑雪行程攻略、住宿比較、費用分攤等功能。

## 技術架構

### 前端
- Vue.js 3 + Composition API
- Tailwind CSS（手機優先響應式設計）
- Vite 建構工具
- Pinia 狀態管理
- Vue Router

### 後端
- Node.js + Express
- SQLite 資料庫（better-sqlite3）
- JWT 認證
- bcryptjs 密碼加密

## 功能特色

### ✅ 已完成功能

1. **會員系統**
   - 會員註冊（帳號/密碼/家族名稱）
   - 會員登入（JWT Token 認證）
   - 密碼加密儲存

2. **行程管理**
   - 建立行程（名稱/日期/目的地/狀態）
   - 編輯行程
   - 刪除行程
   - 複製行程
   - 行程狀態追蹤（規劃中/已確認/已完成）

3. **滑雪專區**
   - 苗場滑雪場攻略
   - GALA湯澤滑雪場攻略
   - 湯沢中里滑雪場攻略
   - 三雪場比較表

4. **費用分攤**
   - 新增費用項目
   - 費用統計（總計/每人平均）

5. **待辦事項**
   - 新增/刪除待辦
   - 完成/未完成切換
   - 滑雪行前準備範本

## 快速開始

### 1. 安裝依賴

```bash
cd travel-planner
npm install
```

### 2. 啟動後端伺服器

```bash
npm run server
```

### 3. 啟動前端開發伺服器（新終端）

```bash
npm run dev
```

### 4. 開啟瀏覽器

```
http://localhost:5173
```

## 開發指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動前端開發伺服器 |
| `npm run server` | 啟動後端 API 伺服器 |
| `npm run dev:full` | 同時啟動前後端（使用 concurrently） |
| `npm run build` | 建構生產版本 |
| `npm run preview` | 預覽建構結果 |

## 專案結構

```
travel-planner/
├── src/                    # 前端原始碼
│   ├── views/              # 頁面元件
│   │   ├── HomeView.vue    # 首頁
│   │   ├── LoginView.vue   # 登入頁
│   │   ├── RegisterView.vue # 註冊頁
│   │   ├── TripsView.vue   # 行程列表
│   │   ├── TripDetailView.vue # 行程詳細
│   │   ├── TripEditView.vue # 行程編輯
│   │   ├── SkiAreaView.vue # 滑雪專區
│   │   ├── ExpensesView.vue # 費用分攤
│   │   └── TodoView.vue    # 待辦事項
│   ├── stores/             # Pinia 狀態管理
│   ├── router/             # Vue Router 設定
│   └── style.css           # 全域樣式
├── server/                  # 後端程式碼
│   ├── routes/             # API 路由
│   ├── middleware/          # 中間件
│   └── models/             # 資料庫模型
├── public/                 # 靜態檔案
└── package.json
```

## API 端點

### 認證
- `POST /api/auth/register` - 會員註冊
- `POST /api/auth/login` - 會員登入
- `GET /api/auth/me` - 取得會員資料

### 行程
- `GET /api/trips` - 取得所有行程
- `GET /api/trips/:id` - 取得行程詳細
- `POST /api/trips` - 建立行程
- `PUT /api/trips/:id` - 更新行程
- `DELETE /api/trips/:id` - 刪除行程
- `POST /api/trips/:id/copy` - 複製行程

### 費用
- `GET /api/expenses` - 取得所有費用
- `POST /api/expenses` - 新增費用
- `DELETE /api/expenses/:id` - 刪除費用

### 待辦事項
- `GET /api/todos` - 取得所有待辦
- `POST /api/todos` - 新增待辦
- `PUT /api/todos/:id` - 更新待辦
- `DELETE /api/todos/:id` - 刪除待辦

## 資料庫

使用 SQLite，資料庫檔案為 `server/database.sqlite`，會自動建立。

## 開發者

小c - 家族旅遊系統開發工程師 🛠️

---

*最後更新：2026-03-23*
