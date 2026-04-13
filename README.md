Bertindaklah sebagai Senior Full-Stack Developer dan DevSecOps Engineer. Tugas Anda adalah membuatkan kode lengkap, struktur proyek, dan konfigurasi untuk membangun aplikasi Web Payment Gateway berbasis QRIS dari Qiospay.

Berikan kode yang production-ready, terstruktur, dengan best practices keamanan dan arsitektur yang rapi. Jangan abaikan detail apa pun.

1. Tech Stack & UI/UX
Framework: Next.js (gunakan App Router terbaru).

Database: PostgreSQL dengan Prisma ORM.

Styling: Tailwind CSS. Gunakan tema bersih dengan latar belakang dominan putih (bg-white) dan aksen biru muda (text-blue-500, bg-blue-100, border-blue-300, dll) untuk tombol, kartu, dan navigasi.

2. Inisialisasi Database & Auto-Setup (First Run)
Setup Script: Buatkan bash script (setup.sh) atau logika inisialisasi pada aplikasi yang akan memeriksa apakah database dan user PostgreSQL sudah ada. Jika belum, jalankan perintah psql -U root (atau superuser lainnya) secara otomatis untuk membuat database dan user yang dibutuhkan.

Auto-Setup Page: Saat web pertama kali dijalankan dan mendeteksi belum ada akun admin/konfigurasi di database, redirect secara paksa ke halaman /setup. Di halaman ini, form setup awal digunakan untuk membuat akun Admin Pertama dan menyimpan konfigurasi dasar.

3. Autentikasi & Keamanan (Security)
Login & Registrasi: Buat halaman autentikasi.

JWT Token: Gunakan JWT untuk autentikasi session dan perlindungan endpoint API. Simpan token di HTTP-Only Cookies.

CSRF Token: Implementasikan proteksi CSRF pada setiap form submission di frontend.

X-Signature: Buat middleware khusus untuk memvalidasi X-Signature pada header API, khususnya untuk endpoint callback/webhook dari Qiospay untuk memastikan request benar-benar dari Qiospay.

4. Konfigurasi Qiospay & Pengaturan Akun
Buat tabel dan halaman "Pengaturan Akun" di dashboard.

Fitur ini untuk menyimpan variabel penting dari Qiospay:

Name (Nama entitas/merchant).

NMID (National Merchant ID).

Data ini wajib dipakai saat meng-generate QRIS dinamis dan untuk memvalidasi webhook.

5. Manajemen Tiket Deposit (Transaksi)
Buat modul deposit dengan aturan bisnis (REST API & UI) berikut:

Generate Tiket: User dapat membuat tiket deposit untuk top-up saldo/bayar.

Ubah Status: Sistem harus bisa mengubah status tiket (Pending, Success, Failed, Expired).

Constraint 3 Hari: Validasi pembuatan tiket: Tiket dengan nominal unik atau identifier yang sama tidak boleh digenerate ulang oleh user yang sama jika belum lewat dari 3 hari (untuk mencegah spam atau conflict di mutasi rekening).

Timeout 10 Menit: Setiap tiket yang di-generate hanya valid selama 10 menit. Buat logika (bisa via Cron Job background process atau kalkulasi validasi on-the-fly saat query) untuk mengubah status tiket menjadi "Expired/Timeout" jika melewati 10 menit.

6. Endpoint Webhook / Callback Qiospay
Buat satu endpoint POST /api/callback/qiospay untuk menerima webhook.

Lakukan pengecekan X-Signature dan IP Address.

Parse data masuk. Jika status success dan jumlah valid, perbarui status tiket deposit menjadi berhasil dan tambahkan saldo user.

Berikut adalah contoh payload webhook asli dari Qiospay untuk Anda jadikan referensi typing/interface:

JSON
{
  "status": "success",
  "data": {
    "amount": 100000,
    "balance": 100000,
    "fee": 0,
    "issuer": "93600535",
    "name": "senowahyu",
    "nmid": "ID2025408537103",
    "refid": "000000TL0VDN",
    "time": "2026-04-12 21:15:25",
    "type": "CR"
  }
}
7. Dokumentasi API Internal
Buat satu halaman /api-docs di dalam web (gunakan Swagger UI, Redoc, atau UI custom statis yang rapi).

Dokumentasikan cara user/pihak ke-3 berinteraksi dengan API web ini (contoh: cara hit API untuk generate tiket, cara mendapatkan profile, menyertakan JWT di header Authorization).

8. Deployment Server (Devsock & Nginx)
Sistem ini akan dijalankan di lingkungan devsock.

Konfigurasikan Custom Next.js Server (server.js) agar tidak berjalan di port localhost biasa, melainkan listen ke Unix Domain Socket (misalnya: /tmp/nextjs-payment.sock).

Buatkan file konfigurasi Nginx (nginx.conf) untuk melakukan Reverse Proxy dari domain publik ke unix socket devsock tersebut.

Format Output yang Diharapkan dari Anda:

Struktur Folder & File (Tree).

Skema Prisma (schema.prisma) yang mencakup tabel User, Setting, dan Transaction/Ticket.

Setup Script (setup.sh) untuk PostgreSQL.

Kode Custom Server & Nginx Proxy.

Kode Endpoint Utama: API Route untuk Webhook Qiospay, Middleware Keamanan (JWT, CSRF, X-Signature), dan API Route untuk Tiket.

Kode UI Utama: Komponen Tailwind untuk Auto-setup dan Dashboard Deposit.

Tulis kode dengan sejelas mungkin dan berikan komentar pada bagian-bagian core logic.
