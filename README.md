# MyAuth

MyAuth adalah aplikasi manajemen pengguna berbasis **Node.js**, **Express**, dan **MongoDB** yang menyediakan fitur sistem login, manajemen menu, role, dan permission. Aplikasi ini dirancang untuk mengatur akses pengguna berdasarkan role dan permission yang ditentukan. Contohnya:
- **Developer** dapat mengakses semua fitur.
- **User** hanya dapat melihat dan mengupdate profil.
- **Admin** memiliki akses terbatas ke menu admin.

Aplikasi ini menggunakan **Passport.js** untuk autentikasi, **Nodemailer** untuk pengiriman email, dan **EJS** sebagai template engine. Template desain menggunakan **STISLA**, sebuah template Bootstrap yang modern dan responsif.

---

## Fitur Utama
1. **Sistem Login dan Register**:
   - Autentikasi menggunakan Passport.js.
   - Verifikasi email dengan Nodemailer.
2. **Manajemen Role dan Permission**:
   - Role dapat diatur untuk mengakses menu dan submenu tertentu.
   - Permission digunakan untuk mengontrol akses ke submenu.
3. **Manajemen Menu dan Submenu**:
   - Menu dan submenu dapat dikelola melalui antarmuka admin.
4. **Template Responsif**:
   - Menggunakan template STISLA untuk tampilan yang modern dan responsif.

---

## Teknologi yang Digunakan
- **Backend**: Node.js, Express.js, MongoDB.
- **Autentikasi**: Passport.js.
- **Pengiriman Email**: Nodemailer.
- **Template Engine**: EJS.
- **Frontend**: Bootstrap (STISLA Template).

---

## Cara Instalasi

### Prasyarat
1. **Node.js**: Pastikan Node.js terinstal di sistem Anda. Unduh dari [nodejs.org](https://nodejs.org/).
2. **MongoDB**: Pastikan MongoDB terinstal dan berjalan. Proyek ini menggunakan **MongoDB Enterprise Edition**. Anda dapat mengunduhnya dari [MongoDB Enterprise](https://www.mongodb.com/try/download/enterprise).
3. **Git**: Untuk mengkloning repositori ini.

### Langkah-langkah
1. **Clone Repositori**
# Install Dependencies

```bash
npm install
```

# Setup Environment

Buat file `.env` di root direktori dan isi dengan konfigurasi .env.example:

# Jalankan MongoDB Enterprise Edition

Pastikan **MongoDB Enterprise Edition** sudah terinstal.

Jalankan MongoDB dari Command Interpreter:

```bash
mongod --dbpath /path/to/your/data/directory
```

Pastikan MongoDB berjalan di `localhost` | `127.0.0.1`.

# Jalankan seed.js

```bash
node seeds/seed.js
```

# Jalankan Aplikasi

```bash
nodemon server.js
```

# Akses Aplikasi

Buka browser dan kunjungi:

[http://localhost:5000](http://localhost:5000)

## Cara Menggunakan

### Login

Gunakan akun default berikut:

- **Developer**: `developer@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`
- **User**: `user@example.com` / `password123`

### Manajemen Role dan Permission

1. Akses menu **Admin** untuk mengatur role dan permission.
2. Tambahkan role baru dan atur permission sesuai kebutuhan.

### Manajemen Menu dan Submenu

- Menu dan submenu dapat dikelola melalui antarmuka **Admin**.

### Catatan:
1. **MongoDB Enterprise Edition**:
   - Pastikan Anda telah mengunduh dan menginstal MongoDB Enterprise Edition dari [situs resmi MongoDB](https://www.mongodb.com/try/download/enterprise).
   - Jalankan MongoDB menggunakan perintah `mongod` dengan menentukan path ke direktori data Anda.
2. **Google API Setup**:
   - Jangan lupa setup **GOOGLE_CLIENT_ID** dan **GOOGLE_CLIENT_SECRET** di Google API Console untuk autentikasi menggunakan Google.

