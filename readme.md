# JWT End-to-End Project

Project ini merupakan implementasi lengkap sistem autentikasi end-to-end menggunakan JSON Web Token (JWT) dengan Express.js, TypeScript, dan HTML. Project ini dirancang sebagai template dasar untuk aplikasi web yang memerlukan sistem autentikasi yang aman dan modern.

## Fitur Utama

### 🔐 Sistem Autentikasi Lengkap
- **Registrasi Pengguna**: Pendaftaran akun baru dengan validasi email dan username unik
- **Login Secure**: Autentikasi dengan enkripsi password menggunakan BCrypt
- **JWT Token**: Implementasi JSON Web Token untuk session management yang stateless
- **Protected Routes**: Middleware untuk melindungi endpoint yang memerlukan autentikasi

### 💾 Database Management
- **SQLite Database**: Database file-based yang mudah untuk development dan testing
- **TypeORM Integration**: ORM modern untuk TypeScript dengan auto-migration
- **Entity Modeling**: Model User dengan relasi dan validasi yang proper
- **Data Persistence**: Penyimpanan data yang aman dengan enkripsi password

### 🎨 User Interface
- **HTML Templates**: Halaman login dan registrasi yang responsive
- **Form Validation**: Validasi client-side dan server-side
- **Error Handling**: Penanganan error yang user-friendly
- **Session Management**: Otomatis handle login/logout state

### 🛡️ Security Features
- **Password Hashing**: BCrypt dengan salt rounds untuk keamanan password
- **JWT Expiration**: Token dengan waktu expired yang dapat dikonfigurasi
- **Input Sanitization**: Validasi dan sanitasi input untuk mencegah injection
- **CORS Protection**: Konfigurasi CORS untuk keamanan cross-origin

## Teknologi yang Digunakan

### Backend
- **Node.js**: Runtime JavaScript untuk server-side development
- **TypeScript**: Superset JavaScript dengan static typing untuk development yang lebih aman
- **Express.js**: Web framework yang minimalis dan fleksibel untuk Node.js
- **TypeORM**: Object-Relational Mapping untuk database management
- **SQLite**: Database SQL yang ringan dan file-based

### Authentication & Security
- **JSON Web Token (JWT)**: Standard untuk secure token-based authentication
- **BCrypt**: Library untuk hashing password dengan salt
- **Crypto**: Built-in Node.js module untuk operasi kriptografi

### Frontend
- **HTML5**: Markup language untuk struktur halaman web
- **CSS3**: Styling untuk tampilan yang modern dan responsive
- **Vanilla JavaScript**: Client-side scripting untuk interaktivitas

### Development Tools
- **ts-node**: TypeScript execution untuk development
- **nodemon**: Auto-restart server saat development
- **dotenv**: Environment variable management

## Struktur Project

```
endtoend/
├── src/
│   ├── app.ts                 # Entry point aplikasi
│   ├── config/
│   │   └── db.ts             # Konfigurasi database SQLite
│   ├── controllers/
│   │   ├── authController.ts  # Logic untuk authentication
│   │   └── userController.ts  # Logic untuk user management
│   ├── middleware/
│   │   └── authMiddleware.ts  # JWT verification middleware
│   ├── models/
│   │   └── userModel.ts      # TypeORM User entity
│   ├── routes/
│   │   ├── authRoutes.ts     # Authentication endpoints
│   │   └── userRoutes.ts     # User management endpoints
│   ├── services/
│   │   └── jwtService.ts     # JWT token management
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   └── views/
│       ├── login.html        # Login page
│       └── register.html     # Registration page
├── data.sql                   # Database schema dan sample data
├── database.sqlite           # SQLite database file (auto-generated)
├── package.json              # NPM dependencies dan scripts
├── tsconfig.json             # TypeScript configuration
├── .env                      # Environment variables
└── README.md                 # Project documentation
```

## API Endpoints

### Authentication
- `POST /auth/register` - Registrasi user baru
- `POST /auth/login` - Login user dan dapatkan JWT token
- `POST /auth/logout` - Logout user (optional)

### User Management
- `GET /users/profile` - Dapatkan profile user (protected)
- `PUT /users/profile` - Update profile user (protected)
- `GET /users` - List semua users (protected, admin only)

### Static Pages
- `GET /` - Redirect ke login page
- `GET /login.html` - Login form
- `GET /register.html` - Registration form

## Prerequisites

Pastikan sistem Anda sudah terinstall:

- **Node.js** (versi 16 atau lebih baru)
- **NPM** atau **Yarn** package manager
- **Git** untuk version control

## Instalasi dan Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd endtoend
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Environment Configuration

Buat file `.env` di root project:

```env
PORT=3000
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
DB_PATH=./database.sqlite
```

### 4. Database Setup

Database SQLite akan otomatis dibuat saat aplikasi pertama kali dijalankan. Jika ingin setup manual:

```bash
# Optional: Import sample data
sqlite3 database.sqlite < data.sql
```

## Cara Menjalankan Project

### Development Mode

```bash
# Start development server dengan auto-reload
npm run dev

# Atau jika menggunakan yarn
yarn dev
```

### Production Mode

```bash
# Build TypeScript ke JavaScript
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run unit tests
npm test

# Run dengan coverage
npm run test:coverage
```

## Penggunaan

### 1. Registrasi User Baru

1. Buka browser ke `http://localhost:3000/register.html`
2. Isi form registrasi dengan username, email, dan password
3. Klik tombol "Register"
4. Jika berhasil, akan diarahkan ke halaman login

### 2. Login

1. Buka browser ke `http://localhost:3000/login.html`
2. Masukkan email dan password
3. Klik tombol "Login"
4. Jika berhasil, akan mendapat JWT token dan diarahkan ke dashboard

### 3. Akses Protected Routes

Untuk mengakses endpoint yang dilindungi, sertakan JWT token di header:

```bash
# Contoh request dengan curl
curl -H "Authorization: Bearer <your-jwt-token>" \
     http://localhost:3000/users/profile
```

## Security Best Practices

### Password Security
- Password di-hash menggunakan BCrypt dengan salt rounds 10
- Minimum password length direkomendasikan 8 karakter
- Kombinasi huruf besar, kecil, angka, dan simbol

### JWT Token Security
- Token expired dalam 1 jam (dapat dikonfigurasi)
- Secret key harus diganti di production
- Token disimpan di localStorage (untuk demo, gunakan httpOnly cookies di production)

### Database Security
- Validasi input untuk mencegah SQL injection
- Unique constraints untuk email dan username
- Proper indexing untuk performa

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Pastikan file database.sqlite dapat ditulis
chmod 666 database.sqlite
```

**2. TypeScript Compilation Error**
```bash
# Clean dan rebuild
npm run clean
npm run build
```

**3. Port Already in Use**
```bash
# Ganti port di .env file
PORT=3001
```

### Logging

Untuk debugging, aktifkan logging di `src/config/db.ts`:

```typescript
logging: true  // Set ke true untuk melihat SQL queries
```

## Contributing

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## License

Project ini menggunakan MIT License. Lihat file `LICENSE` untuk detail lengkap.

## Support

Jika ada pertanyaan atau issue, silakan buat issue di GitHub repository atau hubungi maintainer.

---

**Happy Coding! 🚀**
