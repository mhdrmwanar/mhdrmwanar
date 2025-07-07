# 🔐 PANDUAN ADMIN - JWT Payment Gateway System

## 📋 Daftar Isi
1. [Cara Login sebagai Admin](#cara-login-sebagai-admin)
2. [Dashboard Admin](#dashboard-admin)
3. [Manajemen User](#manajemen-user)
4. [Manajemen Transaksi](#manajemen-transaksi)
5. [API Endpoints Admin](#api-endpoints-admin)

---

## 🔑 Cara Login sebagai Admin

### Akun Admin Default:
- **Username**: `admin`
- **Password**: `admin123`

### Langkah Login:
1. Buka browser dan akses: `http://localhost:3000`
2. Klik **"Login sebagai Admin"**
3. Masukkan kredensial admin
4. Klik **"Masuk"**
5. Anda akan diarahkan ke dashboard admin

---

## 📊 Dashboard Admin

Dashboard admin menampilkan:

### Statistik Sistem:
- **Total Users**: Jumlah semua user dalam sistem
- **Total Transaksi**: Jumlah semua transaksi
- **Transaksi Berhasil**: Jumlah transaksi yang sukses
- **Total Amount**: Total nilai transaksi berhasil

### Data Terbaru:
- **10 User Terbaru**: Daftar user yang baru mendaftar
- **10 Transaksi Terbaru**: Daftar transaksi terbaru dengan detail

---

## 👥 Manajemen User

### Melihat Daftar User:
1. Di dashboard admin, klik tab **"Users"**
2. Anda akan melihat tabel dengan informasi:
   - ID User
   - Username
   - Email
   - Role (admin/user)
   - Status (active/inactive)
   - Tanggal dibuat
   - Aksi (Edit/Delete)

### Membuat User Baru:
1. Klik tombol **"Buat User Baru"**
2. Isi form dengan informasi:
   - Username (wajib)
   - Email (wajib)
   - Password (wajib)
   - Nama Depan (opsional)
   - Nama Belakang (opsional)
   - Nomor Telepon (opsional)
   - Role (user/admin)
3. Klik **"Buat User"**

### Mengedit User:
1. Di tabel user, klik tombol **"Edit"** pada user yang ingin diedit
2. Anda dapat mengubah:
   - Informasi profil
   - Role user
   - Status user
3. Simpan perubahan

### Menghapus User:
1. Klik tombol **"Delete"** pada user yang ingin dihapus
2. User akan di-nonaktifkan (soft delete)
3. **Catatan**: Admin terakhir tidak bisa dihapus

---

## 💳 Manajemen Transaksi

### Melihat Semua Transaksi:
1. Klik tab **"Transactions"**
2. Anda akan melihat:
   - ID Transaksi
   - Reference Number
   - Username pembuat transaksi
   - Amount
   - Status (pending/success/failed)
   - Tanggal dibuat

### Filter Transaksi:
Anda dapat memfilter berdasarkan:
- Status transaksi
- User ID
- Rentang tanggal

### Melihat Detail Transaksi:
1. Klik tombol **"View"** pada transaksi
2. Akan menampilkan detail lengkap termasuk data terenkripsi

---

## 🔧 API Endpoints Admin

### Authentication:
Semua endpoint admin memerlukan:
```
Authorization: Bearer <token_admin>
```

### Dashboard:
```
GET /admin/dashboard
```

### Manajemen User:
```
GET /admin/users                    // Lihat semua user
GET /admin/users/:userId            // Detail user
POST /admin/users                   // Buat user baru
PUT /admin/users/:userId            // Update user
DELETE /admin/users/:userId         // Hapus user
```

### Manajemen Transaksi:
```
GET /admin/transactions             // Lihat semua transaksi
```

---

## 🛡️ Keamanan Admin

### Role-Based Access Control:
- Hanya user dengan role `admin` yang bisa mengakses endpoint admin
- User biasa akan mendapat error `403 Forbidden`

### Validasi Status:
- User admin harus berstatus `active`
- User yang dinonaktifkan tidak bisa akses admin

### Session Management:
- Token JWT divalidasi setiap request
- Token yang expired otomatis logout
- User info diambil real-time dari database

---

## 📝 Tips Penggunaan

1. **Backup Data**: Selalu backup database sebelum melakukan perubahan besar
2. **Monitor Transaksi**: Periksa transaksi gagal secara berkala
3. **Manajemen User**: Jangan biarkan terlalu banyak admin aktif
4. **Keamanan**: Ganti password admin default secara berkala
5. **Log Activity**: Monitor aktivitas admin melalui server logs

---

## 🚨 Troubleshooting

### Tidak Bisa Login Admin:
- Pastikan username dan password benar
- Cek apakah user masih aktif
- Restart server jika perlu

### Error "Admin access required":
- Pastikan user memiliki role `admin`
- Cek status user (harus `active`)

### Token Expired:
- Login ulang untuk mendapatkan token baru
- Cek pengaturan JWT_SECRET di environment

---

## 📞 Dukungan

Jika mengalami masalah, periksa:
1. Server logs di terminal
2. Browser console untuk error JavaScript
3. Database untuk konsistensi data

**Status Sistem Saat Ini:**
- ✅ Server Running: `http://localhost:3000`
- ✅ Database: SQLite Connected
- ✅ Admin Account: Ready
- ✅ Payment Gateway: Functional
- ✅ AES Encryption: Active
