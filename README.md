# QRIS Payment Gateway (Qiospay)

Web Payment Gateway berbasis QRIS dari Qiospay, dibangun dengan Next.js, PostgreSQL, dan Prisma.

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

