# 📋 CHECKLIST DEVELOPMENT & TESTING - JWT E2E APP

## 🏗️ SETUP & KONFIGURASI

### ✅ Environment Setup
- [ ] Install semua dependencies (`npm install`)
- [ ] Setup file `.env` dengan konfigurasi database dan JWT secret
- [ ] Verifikasi TypeScript config (`tsconfig.json`)
- [ ] Test kompilasi (`npm run build`)

### ✅ Database Setup (SQLite File-Based - Tidak Perlu Server DB!)
- [ ] ✨ **SQLite file otomatis dibuat** di `database.sqlite` 
- [ ] ✨ **Tidak perlu install/jalankan database server**
- [ ] Tabel User ter-create otomatis dengan TypeORM
- [ ] Connection database berhasil saat app start
- [ ] Schema synchronize berjalan tanpa error

**🎯 Keuntungan SQLite:**
- ✅ Database tersimpan sebagai file lokal (`database.sqlite`)
- ✅ Tidak perlu MySQL, PostgreSQL, atau MongoDB server
- ✅ Portable - bisa dibawa-bawa bersama project
- ✅ Perfect untuk development dan testing

**Cara Check Success:**
```bash
npm run dev
# Should see: "SQLite database connected successfully"
# Should see: "Database schema synchronized" 
# Should see: "Server is running on http://localhost:3000"
# File database.sqlite akan muncul di root project
```

---

## 📁 SETUP DATABASE SQLITE (TANPA SERVER)

### 🎯 Mengapa SQLite Perfect untuk Project Ini?

**✅ Keuntungan SQLite File-Based:**
- **Tidak perlu install database server** (MySQL, PostgreSQL, MongoDB)
- **Database = 1 file** (`database.sqlite`) yang bisa di-backup mudah
- **Portable** - copy project = copy database juga
- **Perfect untuk development** dan aplikasi skala kecil-menengah
- **Auto-create** tabel dari TypeORM entities
- **Zero configuration** - langsung jalan!

### 🚀 Setup Instructions

**1. Pastikan konfigurasi sudah benar:**
```typescript
// src/config/db.ts - sudah di-setup untuk SQLite
type: "sqlite",
database: path.join(__dirname, "../../database.sqlite"),
synchronize: true, // Auto-create tables
```

**2. File `.env` untuk SQLite:**
```env
JWT_SECRET=mysecretkey_super_secret_change_in_production
PORT=3000
NODE_ENV=development
# SQLite tidak butuh DATABASE_URL!
```

**3. Jalankan aplikasi:**
```bash
npm run dev
```

**4. File `database.sqlite` akan muncul otomatis di root project**

### 🔍 Cara Lihat Isi Database SQLite

**Option 1: VS Code Extension**
- Install: "SQLite Viewer" atau "SQLite Explorer"
- Right-click `database.sqlite` → Open with SQLite Viewer

**Option 2: Command Line**
```bash
# Install sqlite3 tools jika belum ada
npm install -g sqlite3

# Buka database
sqlite3 database.sqlite

# Lihat tabel
.tables

# Lihat data users
SELECT * FROM users;

# Exit
.quit
```

**Option 3: Online SQLite Viewer**
- Upload `database.sqlite` ke https://sqliteviewer.app/

---

## 🔧 BACKEND DEVELOPMENT

### ✅ Models & Database
- [ ] **UserModel** (`src/models/userModel.ts`)
  - [ ] Entity User dengan fields: id, username, email, password
  - [ ] Password hashing dengan BCrypt
  - [ ] Validasi email format
  - [ ] Username unique constraint

### ✅ Services
- [ ] **JWT Service** (`src/services/jwtService.ts`)
  - [ ] Generate JWT token
  - [ ] Verify JWT token
  - [ ] Token expiration handling

### ✅ Controllers
- [ ] **Auth Controller** (`src/controllers/authController.ts`)
  - [ ] Register endpoint
  - [ ] Login endpoint
  - [ ] Logout endpoint
  - [ ] Proper error handling

- [ ] **User Controller** (`src/controllers/userController.ts`)
  - [ ] Get user profile (protected)
  - [ ] Update user profile (protected)

### ✅ Middleware
- [ ] **Auth Middleware** (`src/middleware/authMiddleware.ts`)
  - [ ] JWT token validation
  - [ ] Protected route access control
  - [ ] Error handling untuk invalid/expired token

### ✅ Routes
- [ ] **Auth Routes** (`src/routes/authRoutes.ts`)
  - [ ] POST `/register`
  - [ ] POST `/login`
  - [ ] POST `/logout`

- [ ] **User Routes** (`src/routes/userRoutes.ts`)
  - [ ] GET `/profile` (protected)
  - [ ] PUT `/profile` (protected)

---

## 🎨 FRONTEND DEVELOPMENT

### ✅ HTML Views
- [ ] **Login Page** (`src/views/login.html`)
  - [ ] Form login dengan username/email & password
  - [ ] Client-side validation
  - [ ] Link ke halaman register

- [ ] **Register Page** (`src/views/register.html`)
  - [ ] Form register dengan username, email, password
  - [ ] Password confirmation
  - [ ] Client-side validation
  - [ ] Link ke halaman login

### ✅ Static File Serving
- [ ] Express serve static files untuk HTML
- [ ] CSS styling (optional tapi recommended)
- [ ] JavaScript untuk form handling

---

## 🧪 TESTING MANUAL

### ✅ API Testing (Gunakan Postman/Thunder Client)

#### Registration Testing
- [ ] **POST** `http://localhost:3000/register`
  ```json
  {
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
  }
  ```
  **Expected:** 
  - Status: 201 Created
  - Response: Success message + user data (tanpa password)

- [ ] **Duplicate Registration**
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }
  ```
  **Expected:**
  - Status: 400 Bad Request
  - Response: "Username/Email already exists"

#### Login Testing
- [ ] **POST** `http://localhost:3000/login`
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```
  **Expected:**
  - Status: 200 OK
  - Response: JWT token + user data

- [ ] **Wrong Password**
  ```json
  {
    "username": "testuser", 
    "password": "wrongpassword"
  }
  ```
  **Expected:**
  - Status: 401 Unauthorized
  - Response: "Invalid credentials"

#### Protected Route Testing
- [ ] **GET** `http://localhost:3000/profile`
  - **Without Token**
    - Expected: 401 Unauthorized
  
- [ ] **GET** `http://localhost:3000/profile`
  - **With Valid Token** (Header: `Authorization: Bearer <token>`)
    - Expected: 200 OK + user profile data

- [ ] **GET** `http://localhost:3000/profile`
  - **With Invalid Token**
    - Expected: 401 Unauthorized + "Invalid token"

### ✅ Frontend Testing (Browser)

#### Registration Flow
- [ ] Buka `http://localhost:3000/register.html`
- [ ] Isi form dengan data valid
- [ ] Submit form
- [ ] **Expected:** Redirect ke login atau success message

- [ ] Test validasi: submit form kosong
- [ ] **Expected:** Error messages muncul

#### Login Flow  
- [ ] Buka `http://localhost:3000/login.html`
- [ ] Login dengan credentials yang benar
- [ ] **Expected:** Redirect ke dashboard/profile atau success message

- [ ] Login dengan credentials salah
- [ ] **Expected:** Error message "Invalid credentials"

#### Session Management
- [ ] Setelah login, token tersimpan (localStorage/sessionStorage)
- [ ] Akses halaman protected work dengan token
- [ ] Logout menghapus token
- [ ] Akses halaman protected setelah logout = redirect ke login

---

## 🔍 ERROR HANDLING TESTING

### ✅ Server Error Testing
- [ ] Database connection error handling
- [ ] Invalid JSON payload handling
- [ ] Missing required fields handling
- [ ] SQL injection prevention testing

### ✅ JWT Error Testing
- [ ] Expired token handling
- [ ] Malformed token handling
- [ ] Missing authorization header
- [ ] Invalid token signature

---

## ✅ PRODUCTION READINESS

### ✅ Security Check
- [ ] Environment variables untuk sensitive data
- [ ] Password tidak ter-log di console
- [ ] CORS configuration proper
- [ ] Input sanitization implemented

### ✅ Performance Check
- [ ] Database queries optimized
- [ ] Proper error responses (tidak expose internal error)
- [ ] Memory leaks check

### ✅ Documentation
- [ ] API documentation updated
- [ ] README.md lengkap dengan setup instructions
- [ ] Environment variables documented

---

## 🎯 KRITERIA SUCCESS

### ✅ Application SUCCESS jika:
1. **Server start tanpa error** - Aplikasi berjalan di port 3000
2. **Database connection success** - SQLite database terkoneksi
3. **Registration flow work** - User bisa register dengan validasi proper
4. **Login flow work** - User bisa login dan dapat JWT token
5. **Protected routes work** - Middleware auth berfungsi
6. **Frontend integration work** - HTML forms bisa komunikasi dengan API
7. **Error handling proper** - Semua error case ter-handle dengan baik
8. **Security implemented** - Password hashing, JWT expiration, input validation

### ✅ Testing SUCCESS jika:
1. **Semua API endpoint return expected response**
2. **Frontend forms working dan terintegrasi dengan backend**
3. **Authentication flow complete dari register → login → protected access**
4. **Error scenarios handled gracefully**
5. **No security vulnerabilities found**
6. **File `database.sqlite` terbuat otomatis dan bisa dibuka**

---

## 🗄️ DATABASE TESTING & VERIFICATION

### ✅ Verifikasi Database SQLite
- [ ] File `database.sqlite` muncul di root project setelah `npm run dev`
- [ ] Buka database dengan SQLite viewer dan lihat tabel `users`
- [ ] Test insert data manual:
  ```sql
  INSERT INTO users (username, email, password) 
  VALUES ('testuser', 'test@example.com', 'hashedpassword');
  ```
- [ ] Test query data:
  ```sql
  SELECT * FROM users;
  ```

### ✅ Database Schema Verification
- [ ] Tabel `users` memiliki kolom: id, username, email, password, created_at, updated_at
- [ ] Primary key di kolom `id` (auto increment)
- [ ] Unique constraint di `username` dan `email`
- [ ] Password ter-hash dengan BCrypt

### 🎯 Quick Database Test Commands

**Jalankan aplikasi dan test database:**
```bash
# 1. Start aplikasi
npm run dev

# 2. Buka terminal baru, test dengan sqlite3
sqlite3 database.sqlite

# 3. Di SQLite prompt:
.schema users          # Lihat struktur tabel
.tables                # Lihat semua tabel
SELECT * FROM users;   # Lihat data
.quit                  # Keluar
```

**Install SQLite Viewer di VS Code:**
1. Go to Extensions (Ctrl+Shift+X)
2. Search "SQLite Viewer" 
3. Install by "qwtel"
4. Right-click `database.sqlite` → "Open with SQLite Viewer"

---
3. **Authentication flow complete dari register → login → protected access**
4. **Error scenarios handled gracefully**
5. **No security vulnerabilities found**

---

## 🚀 COMMAND CHEAT SHEET

```bash
# Development
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start           # Start production server

# Testing Tools
# Install REST Client VS Code extension atau gunakan:
# - Postman
# - Thunder Client (VS Code extension)
# - curl commands
```

---

## 📝 PROGRESS TRACKING

Gunakan checkbox di atas untuk track progress. Update status ini setiap kali menyelesaikan item:

**Status Legend:**
- [ ] = Belum dikerjakan
- [x] = Sudah selesai
- [!] = Ada issue yang perlu diperbaiki
- [?] = Perlu review lebih lanjut

**Current Status:** `[Update this as you progress]`
- Setup: `[ ]%`
- Backend: `[ ]%` 
- Frontend: `[ ]%`
- Testing: `[ ]%`
- Production Ready: `[ ]%`
