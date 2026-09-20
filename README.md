# Dynamic Excel Import Engine

Aplikasi untuk mengimport data dari file Excel ke database secara fleksibel.
Admin membuat konfigurasi (nama field, tipe data, validasi) untuk satu jenis
data (misalnya Employee, Customer, Asset), lalu user tinggal download
template, isi, upload, dan sistem akan validasi + import datanya —
tanpa perlu tulis kode baru setiap ada jenis data baru.

Alur: **Configuration → Upload Excel → Preview → Validation → Import → Result**

## Technology Stack

| Layer            | Teknologi                                               |
| ---------------- | ------------------------------------------------------- |
| Framework        | Next.js 15 (App Router) + TypeScript                    |
| Database         | PostgreSQL                                              |
| ORM              | Prisma 6                                                |
| Styling          | Tailwind CSS + shadcn/ui                                |
| Form & Validasi  | react-hook-form + zod                                   |
| Excel Processing | exceljs                                                 |
| Auth             | JWT custom (library `jose`) disimpan di httpOnly cookie |
| Password Hashing | bcryptjs                                                |

## Instalasi

```bash
git clone <url-repo-ini>
cd dynamic-import-engine
npm install
```

## Konfigurasi Environment

Buat file `.env` di root project:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dynamic_import_engine?schema=public"
JWT_SECRET="ganti-dengan-string-acak-yang-panjang"
```

## Setup Database

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

Perintah terakhir akan membuat 2 akun contoh (lihat bagian **Akun Contoh** di bawah).

## Menjalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000/login](http://localhost:3000/login).

## Akun Contoh

| Role  | Email             | Password |
| ----- | ----------------- | -------- |
| Admin | admin@example.com | admin123 |
| User  | user@example.com  | user123  |

Admin bisa membuat & mengubah Import Configuration di `/admin/configurations`.
User biasa bisa melakukan import data di `/import` dan melihat riwayatnya sendiri di `/import/history`.

## Alur Penggunaan Singkat

1. Login sebagai Admin → `/admin/configurations` → buat konfigurasi baru (contoh: "Employee Import") beserta field mapping-nya.
2. Login sebagai User → `/import` → pilih konfigurasi tersebut.
3. Download template Excel, isi datanya.
4. Upload file → sistem menampilkan Preview (jumlah baris valid/invalid beserta alasan errornya).
5. Klik "Process Import" untuk memasukkan baris yang valid ke database.
6. Lihat hasil di halaman Import Result, dan cek rekapnya di `/import/history`.
