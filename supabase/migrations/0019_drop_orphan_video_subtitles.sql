-- Drop orphan table video_subtitles — rapikan kode mati + tutup MEDIUM-2 (2026-08-07).
--
-- LATAR: tabel `video_subtitles` (migration 0016) + dua route yang menyentuhnya
-- (`app/api/subtitles/save`, `app/api/subtitles/get`) TAK PERNAH dipanggil dari
-- mana pun (dicek 2026-08-07 di app/, lib/, public/legacy termasuk bundle .min.js
-- — nol pemanggil). Subtitle ASLI yang benar-benar dipakai disimpan sebagai blob
-- `user_state.state.myVideos[].subtitleVtt` + disajikan via /api/public-video, dan
-- diterjemahkan stateless via /api/translate-subtitle — tak ada yang menyentuh
-- tabel ini. Kedua route sudah DIHAPUS dari kode di commit yang sama.
--
-- Selain kode mati, tabel ini adalah footgun MEDIUM-2 (audit): kunci hanya
-- `video_id` teks tanpa kolom owner; id video legacy = timestamp per-user (bisa
-- tabrakan antar-akun) → kalau route-nya dihidupkan lagi, subtitle bisa nyasar
-- ke video akun lain. Membuang tabelnya menutup celah itu untuk selamanya.
--
-- AMAN: tabel ini KOSONG (tak pernah ditulis aplikasi) + RLS deny-all tanpa
-- policy (tak ada akses klien). Menjatuhkannya tak menghapus data pengguna apa pun.
-- File 0016 TIDAK diedit (jangan sunting migrasi lama — rak supabase-prisma §1);
-- ini migration BARU yang membalik efeknya.
--
-- Idempotent. Run via Supabase Dashboard → SQL Editor (BUKAN CLI).

-- ============================================================
-- PRE-FLIGHT (WAJIB — buktikan tabel benar kosong sebelum drop)
-- ============================================================
-- select count(*) as should_be_zero from public.video_subtitles;
--   -- Kalau > 0: BERHENTI. Ada data tak terduga — selidiki dulu, jangan drop.

-- ============================================================
-- MIGRATION — drop tabel yatim
-- ============================================================
drop table if exists public.video_subtitles;
-- (index & policy ikut terhapus bersama tabel; tak ada fungsi/trigger khusus.)

-- ============================================================
-- ROLLBACK (kalau ternyata mau dipakai lagi nanti — re-apply 0016)
-- ============================================================
-- Jalankan ulang isi migration 0016_video_subtitles.sql untuk membuat kembali.

-- ============================================================
-- DONE. Verifikasi:
--   select to_regclass('public.video_subtitles');  -- harus NULL (tabel hilang)
-- ============================================================
