-- KV anon READ leak fix — data pribadi (PII) bocor ke publik (2026-07-07).
--
-- MASALAH (GENTING): policy `kv_anon_platform_read` (dari 0012) mengizinkan anon
-- membaca SEMUA baris `user_id IS NULL`, dengan asumsi baris ber-user_id-NULL =
-- "data platform" yang aman dibagi. TERNYATA banyak kunci DATA PRIBADI (PII)
-- disimpan dengan user_id = NULL (karena `kv_is_per_user_key` tak mengenali
-- prefix-nya), sehingga ikut kebaca siapa pun tanpa login (anon key ada di
-- browser publik). Ditemukan 2026-07-07 via cek kesehatan: 214 baris kv terbaca
-- anon, termasuk:
--   - playly-login-attempts-{email}  → EMAIL pengguna + jumlah percobaan login
--   - playly-sessions-{email}        → data sesi per pengguna
--   - playly-user-audit-{email}      → jejak audit per pengguna
--   - playly-daily-snapshot-{user}, playly-video-snapshot-{user} → analitik per user
--   - playly-admin-tickets/targets/revoked, playly-trash-videos    → data admin
--
-- Migration 0013 sudah menutup kebocoran playly-account-* (hash password) dengan
-- men-stamp user_id. Migration INI menutup sisa PII di jalur READ, tanpa
-- bergantung pada stamping (kunci ini pakai email/username, tak selalu bisa
-- di-map ke user_id — mis. akun sudah terhapus).
--
-- PENDEKATAN: perketat HANYA policy READ anon (blacklist pola PII + tetap
-- tolak orphan per-user). TIDAK menyentuh policy INSERT/UPDATE/DELETE maupun
-- fungsi `kv_is_per_user_key` → alur tulis (cloud-sync, rate-limit) TIDAK berubah,
-- jadi risiko merusak fitur minimal. Anon tetap boleh BACA config platform publik
-- (playly-ad-config, guest-lang/theme, banned-words, video-comments, dll) yang
-- memang dibutuhkan halaman publik (mis. /watch baca playly-ad-config).
--
-- Idempotent. Run via Supabase Dashboard → SQL Editor (BUKAN CLI). JALANKAN
-- PRE-FLIGHT DULU. Sediakan ROLLBACK sebelum apply.

-- ============================================================
-- PRE-FLIGHT (read-only — jalankan + tinjau dulu)
-- ============================================================
-- A) Baris PII yang SEKARANG bocor ke anon (harus jadi 0 setelah apply):
--    select key from public.kv
--    where user_id is null
--      and ( key like 'playly-login-attempts-%'
--         or key like 'playly-sessions-%'
--         or key like 'playly-user-audit-%'
--         or key like 'playly-daily-snapshot-%'
--         or key like 'playly-video-snapshot-%'
--         or key like 'playly-admin-tickets%'
--         or key like 'playly-admin-targets%'
--         or key like 'playly-admin-revoked%'
--         or key like 'playly-trash-videos%' )
--    order by key;
--
-- B) Yang MASIH boleh dibaca anon setelah apply (config publik) — pastikan
--    tak ada PII nyasar di sini:
--    select key from public.kv
--    where user_id is null
--      and not public.kv_is_per_user_key(key)
--      and key not like 'playly-login-attempts-%'
--      and key not like 'playly-sessions-%'
--      and key not like 'playly-user-audit-%'
--      and key not like 'playly-daily-snapshot-%'
--      and key not like 'playly-video-snapshot-%'
--      and key not like 'playly-admin-tickets%'
--      and key not like 'playly-admin-targets%'
--      and key not like 'playly-admin-revoked%'
--      and key not like 'playly-trash-videos%'
--    order by key;
--    -- Tinjau: harusnya cuma config (ad, lang, theme, banned-words, comments, dll).

-- ============================================================
-- MIGRATION — perketat kv_anon_platform_read
-- ============================================================
drop policy if exists "kv_anon_platform_read" on public.kv;
create policy "kv_anon_platform_read" on public.kv
  for select
  to anon
  using (
    user_id is null
    -- Orphan per-user (account/prefs/state/dll) walau user_id NULL → tetap tolak
    -- (defense-in-depth, selaras policy insert/update di migration 0013).
    and not public.kv_is_per_user_key(key)
    -- Blacklist eksplisit pola PII / data sensitif yang TIDAK dibutuhkan halaman
    -- publik anon (halaman publik hanya baca playly-ad-config + playly-state).
    and key not like 'playly-login-attempts-%'
    and key not like 'playly-sessions-%'
    and key not like 'playly-user-audit-%'
    and key not like 'playly-daily-snapshot-%'
    and key not like 'playly-video-snapshot-%'
    and key not like 'playly-admin-tickets%'
    and key not like 'playly-admin-targets%'
    and key not like 'playly-admin-revoked%'
    and key not like 'playly-trash-videos%'
  );

-- NOTE: policy kv_anon_platform_insert/update/delete (0012/0013) + kv_per_user_*
-- (0008) TIDAK diubah. Hanya jalur BACA anon yang diperketat.

-- ============================================================
-- POST-VERIFY (jalankan sebagai anon — mis. browser incognito, anon key)
-- ============================================================
-- 1) Anon TIDAK bisa baca PII lagi (target: [] kosong):
--    fetch('<SUPABASE_URL>/rest/v1/kv?select=key&key=like.playly-login-attempts-*',
--      { headers:{ apikey:'<anon>', authorization:'Bearer <anon>' } })
--      .then(r=>r.json()).then(d=>console.log('login-attempts anon (expect []):', d));
--    -- ulangi utk playly-sessions-*, playly-user-audit-*, playly-daily-snapshot-*
--
-- 2) Anon MASIH bisa baca config publik (target: ada isi):
--    fetch('<SUPABASE_URL>/rest/v1/kv?select=key&key=eq.playly-ad-config',
--      { headers:{ apikey:'<anon>', authorization:'Bearer <anon>' } })
--      .then(r=>r.json()).then(d=>console.log('ad-config anon (expect isi):', d));
--
-- 3) Flow login + /watch + landing masih normal (buka app, cek tak ada error baru).

-- ============================================================
-- ROLLBACK (kalau ada fitur publik yang rusak setelah apply)
-- ============================================================
-- drop policy if exists "kv_anon_platform_read" on public.kv;
-- create policy "kv_anon_platform_read" on public.kv
--   for select to anon using (user_id is null);
-- -- (kembali ke perilaku 0012 — CATATAN: ini membuka lagi kebocoran PII, jadi
-- --  segera cari config publik yang ke-blacklist lalu re-apply versi diperbaiki.)

-- ============================================================
-- DONE.
-- ============================================================
