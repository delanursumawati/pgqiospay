# QRIS Payment Gateway (Qiospay)

Web Payment Gateway berbasis QRIS dari Qiospay, dibangun dengan Next.js, PostgreSQL, dan Prisma.

## Screenshots

### Halaman Login

<table>
  <tr>
    <th>Desktop</th>
    <th>Mobile</th>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/f665392b-8370-48ff-92d2-57fd8f9e562b" alt="Login - Desktop" width="600" /></td>
    <td><img src="https://github.com/user-attachments/assets/5eb13118-ded9-4322-97dd-7edc2791a040" alt="Login - Mobile" width="250" /></td>
  </tr>
</table>

### Halaman Register

<table>
  <tr>
    <th>Desktop</th>
    <th>Mobile</th>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/02336832-1ca9-4cac-83e9-e2035a774954" alt="Register - Desktop" width="600" /></td>
    <td><img src="https://github.com/user-attachments/assets/38a472e5-917d-451b-84e0-1a19ffba0618" alt="Register - Mobile" width="250" /></td>
  </tr>
</table>

### Halaman Setup

<table>
  <tr>
    <th>Desktop</th>
    <th>Mobile</th>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/ee9d6aa9-773d-474a-abbb-08a9d447e8b8" alt="Setup - Desktop" width="600" /></td>
    <td><img src="https://github.com/user-attachments/assets/06fadaf5-6c8d-4356-a6b1-55ce8afae417" alt="Setup - Mobile" width="250" /></td>
  </tr>
</table>

### Halaman Dashboard

<table>
  <tr>
    <th>Desktop</th>
    <th>Mobile</th>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/6dbcfc6f-1b1c-4bb8-88e9-5b53969ddb4d" alt="Dashboard - Desktop" width="600" /></td>
    <td><img src="https://github.com/user-attachments/assets/ac2fc38e-9b9c-4c13-b988-d8517c4adbc4" alt="Dashboard - Mobile" width="250" /></td>
  </tr>
</table>

### Halaman Deposit

<table>
  <tr>
    <th>Desktop</th>
    <th>Mobile</th>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/e38fd827-c5a9-4885-bf49-c4302f8743ec" alt="Deposit - Desktop" width="600" /></td>
    <td><img src="https://github.com/user-attachments/assets/adcc0432-7c3b-4729-a9e3-d77d3ca1fd36" alt="Deposit - Mobile" width="250" /></td>
  </tr>
</table>

### Halaman Settings (Admin)

<table>
  <tr>
    <th>Desktop</th>
    <th>Mobile</th>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/aad7009b-7dd1-4b47-8adb-a734d34d0211" alt="Settings - Desktop" width="600" /></td>
    <td><img src="https://github.com/user-attachments/assets/0533f867-31b2-427d-8bf6-cafca02ede5f" alt="Settings - Mobile" width="250" /></td>
  </tr>
</table>

### Halaman API Documentation

<table>
  <tr>
    <th>Desktop</th>
    <th>Mobile</th>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/2bc6c2bf-81bf-4576-9734-d3790a20b5b8" alt="API Docs - Desktop" width="600" /></td>
    <td><img src="https://github.com/user-attachments/assets/96292126-6795-4071-b9fd-88265eba4753" alt="API Docs - Mobile" width="250" /></td>
  </tr>
</table>

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL + Prisma ORM 7
- **Styling**: Tailwind CSS (tema putih + aksen biru)
- **Auth**: JWT (HTTP-Only Cookies) + CSRF Token
- **Security**: X-Signature validation, IP filtering

## Struktur Proyek

```
pgqiospay/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/           # Login, Register, Profile
│   │   │   ├── callback/       # Webhook endpoint Qiospay
│   │   │   ├── csrf/           # CSRF token generation
│   │   │   ├── settings/       # App settings (admin)
│   │   │   ├── setup/          # Initial setup
│   │   │   └── tickets/        # Deposit tickets
│   │   ├── api-docs/           # API documentation page
│   │   ├── dashboard/          # Dashboard, Deposit, Settings
│   │   ├── login/              # Login page
│   │   ├── register/           # Register page
│   │   └── setup/              # Initial setup page
│   ├── lib/
│   │   ├── auth.ts             # JWT utilities
│   │   ├── csrf.ts             # CSRF token management
│   │   ├── hooks.ts            # React hooks
│   │   ├── prisma.ts           # Database client
│   │   ├── signature.ts        # X-Signature validation
│   │   └── tickets.ts          # Deposit ticket logic
│   └── middleware.ts           # Route protection
├── server.js                   # Custom server (Unix socket)
├── nginx.conf                  # Nginx reverse proxy config
├── setup.sh                    # PostgreSQL setup script
└── .env.example                # Environment variables template
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials

# Auto-setup PostgreSQL (requires psql with superuser)
bash setup.sh

# Or manually push schema
npx prisma db push
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Initial Setup

Buka browser ke `http://localhost:3000`. Anda akan diarahkan ke halaman `/setup` untuk membuat akun admin pertama dan konfigurasi Qiospay.

## Deployment (Devsock + Nginx)

### Unix Socket Mode

```bash
npm run build
SOCKET_PATH=/tmp/nextjs-payment.sock node server.js
```

### Nginx Configuration

Copy `nginx.conf` ke `/etc/nginx/sites-available/` dan sesuaikan domain. Lihat file untuk detail konfigurasi.

## API Documentation

Dokumentasi API tersedia di `/api-docs` setelah aplikasi berjalan.

## Fitur Utama

- **Auto-Setup**: Redirect ke `/setup` saat pertama kali dijalankan
- **Deposit Tickets**: Generate tiket dengan unique code, timeout 10 menit, cooldown 3 hari
- **Webhook Qiospay**: Endpoint callback dengan validasi X-Signature dan IP
- **Dashboard**: Manajemen saldo, deposit, dan pengaturan
- **Keamanan**: JWT, CSRF, X-Signature, IP filtering

