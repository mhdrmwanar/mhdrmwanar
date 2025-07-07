# Secure Payment Gateway - Implementasi Keamanan End-to-End

Project ini merupakan implementasi **"Implementasi Keamanan End-to-End dengan Algoritma AES dan Kunci Pribadi Berdasarkan Identifier Unik Pengguna pada Sistem Payment Gateway"** menggunakan Express.js, TypeScript, dan SQLite.

## 🔐 Fitur Keamanan Utama

### 🛡️ Enkripsi End-to-End dengan AES
- **Algoritma AES-256**: Enkripsi data payment menggunakan Advanced Encryption Standard 256-bit
- **Kunci Pribadi Unik**: Setiap pengguna memiliki kunci enkripsi pribadi yang unik
- **Key Derivation**: Menggunakan PBKDF2 dengan 10,000 iterasi untuk generate kunci yang aman
- **Zero Knowledge**: Server tidak menyimpan kunci enkripsi dalam bentuk plain text

### 🔑 Manajemen Kunci Berbasis Identifier Pengguna
- **User-Specific Keys**: Kunci enkripsi dibuat berdasarkan kombinasi User ID + Email
- **Key Hashing**: Verifikasi integritas kunci menggunakan SHA-256
- **Master Key Protection**: Master key terpisah untuk layer keamanan tambahan
- **Key Rotation**: Kemampuan untuk rotasi kunci secara berkala

### 💳 Secure Payment Processing
- **Encrypted Card Data**: Nomor kartu, CVV, dan data sensitif dienkripsi
- **Payment Tokens**: Token sementara dengan expiry time untuk keamanan session
- **Transaction Tracking**: Setiap transaksi memiliki ID unik dan audit trail
- **Fraud Detection**: Basic fraud detection dengan risk scoring

## 🏗️ Arsitektur Keamanan

### Layer 1: Transport Security
- HTTPS/TLS encryption untuk data in transit
- Secure headers dan CORS protection

### Layer 2: Authentication 
- JWT-based authentication dengan signed tokens
- Token expiration dan refresh mechanism

### Layer 3: Application Security
- AES encryption untuk data sensitif
- User-specific private keys
- Input validation dan sanitization

### Layer 4: Database Security
- Encrypted storage untuk payment data
- Access controls dan audit logging
- No plain text sensitive data storage

## 📋 Model Data

### Payment Model
```typescript
- id: UUID (Primary Key)
- userId: Foreign Key ke User
- amount: Decimal (15,2)
- currency: String
- paymentMethod: Enum (credit_card, debit_card, etc.)
- status: Enum (pending, processing, completed, failed)
- encryptedPaymentData: Text (AES encrypted)
- keyHash: String (SHA-256 hash)
- paymentToken: String (temporary session token)
- merchantId: String
- timestamps: created, updated, completed, expired
```

### Transaction Model
```typescript
- id: UUID (Primary Key)
- paymentId: Foreign Key ke Payment
- type: Enum (charge, refund, authorization, etc.)
- status: Enum (pending, processing, completed, failed)
- encryptedTransactionData: Text (AES encrypted)
- keyHash: String (verification hash)
- externalTransactionId: String
- processorResponse: String
- riskScore: Number
- timestamps: created, processed, expired
```

## 🚀 API Endpoints

### Authentication
- `POST /auth/register` - Registrasi pengguna baru
- `POST /auth/login` - Login dan dapatkan JWT token
- `POST /auth/logout` - Logout pengguna

### Payment Gateway
- `POST /payments/create` - Buat payment baru dengan enkripsi AES
- `POST /payments/process` - Proses payment dengan verifikasi token
- `GET /payments/status/:paymentId` - Cek status payment
- `GET /payments/history` - Riwayat payment pengguna
- `POST /payments/refund/:paymentId` - Refund payment

### User Management
- `GET /users/profile` - Dapatkan profile pengguna
- `PUT /users/profile` - Update profile pengguna

## 🔧 Setup dan Instalasi

### Prerequisites
- Node.js 16+ 
- NPM atau Yarn
- SQLite (otomatis dibuat)

### Environment Variables
```env
JWT_SECRET=mysecretkey_super_secret_change_in_production
MASTER_ENCRYPTION_KEY=master_aes_key_for_payment_encryption_change_in_production
PORT=3000
NODE_ENV=development
```

### Instalasi
```bash
# Clone repository
git clone <repository-url>
cd secure-payment-gateway

# Install dependencies
npm install

# Start development server
npm run dev
```

### Struktur Database
Database SQLite akan otomatis dibuat dengan tabel:
- `users` - Data pengguna
- `payments` - Data payment terenkripsi
- `transactions` - Log transaksi

## 💻 Cara Penggunaan

### 1. Registrasi & Login
1. Buka `http://localhost:3000/register.html`
2. Daftar akun baru
3. Login di `http://localhost:3000/login.html`

### 2. Membuat Payment
1. Setelah login, akan diarahkan ke Payment Gateway
2. Isi form payment dengan data kartu
3. Klik "Create Secure Payment"
4. Data kartu akan dienkripsi dengan AES menggunakan kunci pribadi pengguna

### 3. Monitoring Transaksi
- Tab "Payment History" untuk melihat riwayat transaksi
- Tab "Security Info" untuk informasi teknis keamanan

## 🔬 Algoritma Enkripsi

### Key Generation
```typescript
// Generate kunci pribadi berdasarkan identifier pengguna
const userIdentifier = `${userId}_${userEmail}`;
const privateKey = PBKDF2(userIdentifier, masterKey, {
    keySize: 256/32,
    iterations: 10000
});
```

### Data Encryption
```typescript
// Enkripsi data payment dengan AES
const encryptedData = AES.encrypt(paymentData, userPrivateKey);
const keyHash = SHA256(userPrivateKey); // Untuk verifikasi
```

### Token Security
```typescript
// Payment token dengan expiry
const paymentToken = AES.encrypt({
    userId, transactionId, timestamp, nonce
}, masterKey);
```

## 📊 Fitur Keamanan Lanjutan

### 1. Fraud Detection
- IP address tracking
- Device fingerprinting  
- Risk scoring algorithm
- Transaction pattern analysis

### 2. Audit & Logging
- Comprehensive transaction logs
- Security event monitoring
- Hash verification untuk data integrity
- Timestamp untuk semua operasi

### 3. PCI DSS Compliance Ready
- No storage of sensitive card data in plain text
- Secure key management
- Access controls dan authentication
- Regular security auditing capabilities

## 🧪 Testing

### Manual Testing dengan Postman/curl

#### 1. Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

#### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

#### 3. Create Encrypted Payment
```bash
curl -X POST http://localhost:3000/payments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "amount": 100.00,
    "currency": "USD",
    "paymentMethod": "credit_card",
    "merchantId": "MERCHANT_001",
    "cardNumber": "4111111111111111",
    "cardHolderName": "John Doe",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123"
  }'
```

## 🔐 Keamanan Production

### Recommendations untuk Production:
1. **Environment Variables**: Ganti semua default keys
2. **HTTPS**: Gunakan SSL/TLS certificate
3. **Database**: Gunakan PostgreSQL/MySQL untuk production
4. **Key Rotation**: Implement regular key rotation
5. **Monitoring**: Setup security monitoring dan alerting
6. **Backup**: Regular encrypted backups
7. **Access Control**: Implement role-based access control

## 📝 Kontribusi

1. Fork repository
2. Create feature branch
3. Implement security enhancements
4. Add comprehensive tests
5. Submit pull request

## 📄 License

MIT License - Lihat file LICENSE untuk detail lengkap.

---

**🔒 Security Notice**: Project ini dirancang untuk tujuan edukatif dan demonstrasi. Untuk penggunaan production, pastikan implementasi additional security measures dan compliance dengan standar industri seperti PCI DSS.

**🚀 Built with Security First Approach**

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
jwt-end2/
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
├── wajib.md                  # Development checklist
├── .env                      # Environment variables
└── readme.md                 # Project documentation
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
cd jwt-end2
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Environment Configuration

Buat file `.env` di root project:

```env
PORT=3000
JWT_SECRET=mysecretkey_super_secret_change_in_production
NODE_ENV=development
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
