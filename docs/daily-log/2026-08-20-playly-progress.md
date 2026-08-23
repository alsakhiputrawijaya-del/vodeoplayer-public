# Ringkasan Progress Playly — 20 Agustus 2026

## Tujuan Hari Ini
- Memperbaiki fitur resolusi video (360p/480p/720p/1080p) agar berfungsi di local dan online.
- Setup worker transcoder lokal.
- Mempersiapkan deploy online agar tidak perlu jalankan server manual saat PC dimatikan.

## Yang Sudah Diselesaikan

### 1. Worker Transcoder Lokal
- Berhasil menjalankan worker di `workers/transcoder/`.
- Menggunakan Supabase key format baru (`sb_secret_...`).
- Library `@supabase/supabase-js` di-update ke versi terbaru di worker.
- Migration tabel `video_transcode_jobs` sudah di-apply ke Supabase.
- Worker berhasil terhubung ke database dan siap polling job transcode.

### 2. Storage
- Storage dipindahkan dari Cloudflare R2 ke **Supabase Storage S3-compatible**.
- Worker sudah support `S3_*` environment variables dan endpoint Supabase Storage.

### 3. Environment Variables
- File `.env` di root project dibuat/diisi dengan variabel yang diperlukan Next.js.
- Secret key (service role, S3 credentials) disalin dari `workers/transcoder/.env` ke root `.env` tanpa diekspos ke chat.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` diisi dengan publishable key Supabase.

### 4. Player & Menu Kualitas
- Fitur resolusi sudah berfungsi di halaman **Pustaka Saya** — menu Kualitas menampilkan 1080p.
- Menambahkan menu pilihan kualitas (360p/480p/720p/1080p) di halaman **watch publik** (`public/legacy/watch-init.js`).
- API `/api/public-video` sudah mengembalikan field `variants`.

### 5. Update Library Root Project
- `@supabase/supabase-js` dan `@supabase/ssr` di root project di-update ke versi terbaru untuk support key format baru Supabase.

## Kendala
- Deploy ke **Render** tertahan karena verifikasi kartu kredit.
- Deploy ke **Fly.io** juga tertahan karena diminta verifikasi metode pembayaran.
- User tidak memiliki kartu kredit/debit.

## Langkah Selanjutnya
- Deploy worker transcoder ke **Koyeb** (alternatif yang free tier tidak selalu butuh kartu kredit).
- Konfigurasi Koyeb sudah disiapkan di `workers/transcoder/koyeb.yaml`.
- Setelah worker online, deploy Next.js app ke **Vercel** dan sambungkan via `TRANSCODER_WEBHOOK_URL`.

## File yang Dimodifikasi / Dibuat Hari Ini
- `workers/transcoder/index.mjs`
- `workers/transcoder/package.json`
- `workers/transcoder/.env` (user isi secret)
- `workers/transcoder/.env.example`
- `workers/transcoder/Dockerfile`
- `workers/transcoder/fly.toml`
- `workers/transcoder/.dockerignore`
- `workers/transcoder/koyeb.yaml`
- `public/legacy/watch-init.js`
- `public/legacy/watch.css`
- `.env` (root project)
- `package.json` / `package-lock.json` (update Supabase libs)
- `docs/daily-log/2026-08-20-playly-progress.md` (file ini)

## Catatan Keamanan
- Semua secret key (service role, S3 access key, dll.) tidak tertulis di file ini.
- Jangan pernah meng-commit secret ke repository.
