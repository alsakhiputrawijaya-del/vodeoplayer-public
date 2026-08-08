# Playly Transcoder Worker

Service terpisah untuk memproses video menjadi multi-resolusi (360p, 480p, 720p, 1080p) menggunakan ffmpeg.

## Cara kerja

1. API Next.js (`/api/transcode/request`) membuat job di tabel `public.video_transcode_jobs`.
2. API kemudian memanggil webhook `POST /process` di worker (jika `TRANSCODER_WEBHOOK_URL` di-set).
3. Worker mengunduh file original dari R2 ke `/tmp`.
4. Menjalankan ffmpeg untuk tiap resolusi yang lebih rendah atau sama dengan tinggi video asli.
5. Mengunggah hasil ke R2 dengan key `videos/{id}_{height}p.{ext}`.
6. Menyimpan URL variant di kolom `variants` tabel job dan di metadata `user_state.state.myVideos[].variants`.
7. Worker juga polling Supabase tiap 10 detik sebagai backup kalau webhook miss.

## Prasyarat

- Node.js 20+
- ffmpeg & ffprobe terinstall (atau jalankan via Docker).
- Environment variables (lihat `.env.example`).

## Environment variables

| Variable | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (jangan expose ke browser!). |
| `R2_ACCOUNT_ID` | Cloudflare account ID. |
| `R2_ACCESS_KEY_ID` | R2 API token access key. |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret. |
| `R2_BUCKET` | Nama bucket (biasanya `videos`). |
| `R2_PUBLIC_URL` | Public URL R2, contoh `https://cdn.playly.id`. |
| `WEBHOOK_SECRET` | Secret untuk endpoint `/process` (opsional tapi direkomendasikan). |
| `PORT` | Port HTTP server (default `3000`). |
| `POLL_INTERVAL_MS` | Interval polling Supabase (default `10000`). |

## Jalankan lokal

```bash
cd workers/transcoder
cp .env.example .env
# isi .env
npm install
npm start
```

## Jalankan dengan Docker

```bash
cd workers/transcoder
docker build -t playly-transcoder .
docker run --env-file .env -p 3000:3000 playly-transcoder
```

## Deploy produksi

Pilih salah satu:

### 1. Render Web Service (paling mudah)

Deploy folder `workers/transcoder` sebagai **Web Service** pakai Dockerfile. Render akan expose port HTTP; health check bisa ke `/health`.

Setelah deploy:
1. Copy URL worker, misal `https://playly-transcoder.onrender.com`.
2. Tambah environment variables di Vercel (project Next.js):
   - `TRANSCODER_WEBHOOK_URL=https://playly-transcoder.onrender.com/process`
   - `TRANSCODER_WEBHOOK_SECRET=sama-dengan-WEBHOOK_SECRET-di-Render`

### 2. Fly.io

```bash
cd workers/transcoder
fly launch --no-code --dockerfile Dockerfile --name playly-transcoder
fly secrets set NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... R2_ACCOUNT_ID=...
```

### 3. Railway

Hubungkan repo ke Railway, pilih folder `workers/transcoder`, deploy sebagai Docker service.

### 4. VPS / Docker Compose

Lihat `docker-compose.yml` di folder ini.

> Catatan: worker ini **tidak bisa di-deploy ke Vercel** karena memerlukan ffmpeg binary dan durasi eksekusi lebih dari batas serverless function.
