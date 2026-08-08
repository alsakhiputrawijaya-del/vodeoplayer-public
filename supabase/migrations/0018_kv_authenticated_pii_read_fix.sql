-- KV authenticated READ leak fix — audit HIGH-2 (2026-08-07).
--
-- MASALAH: migration 0015 menutup kebocoran PII di jalur BACA *anon*, TAPI policy
-- BACA *authenticated* (`kv_per_user_select` dari 0008) tak pernah ikut diperketat.
-- Policy itu masih:
--     using ( user_id is null or auth.uid() = user_id )
-- artinya SETIAP user yang login bisa membaca SEMUA baris `user_id IS NULL` —
-- termasuk baris PII yatim yang tak bisa di-map ke user (akun terhapus, kunci
-- ber-suffix email/username) yang justru jadi alasan 0015 dibuat:
--   - playly-login-attempts-{email}  → email + percobaan login
--   - playly-sessions-{email} / playly-user-audit-{email}
--   - playly-daily/video-snapshot-*  → analitik per user
--   - playly-account-{email} yatim   → HASH PASSWORD (PBKDF2)
-- Baris yang 0015 blokir untuk anon MASIH kebaca oleh user login mana pun
-- (mis. lewat /api/kv/list yang query pakai sesi authenticated).
--
-- PENDEKATAN: samakan jalur BACA authenticated dengan pola 0015 — owner tetap
-- baca barisnya sendiri; platform-config publik (user_id NULL, bukan per-user,
-- bukan PII) tetap kebaca; PII/orphan ditolak. TIDAK menyentuh INSERT/UPDATE/
-- DELETE (0008/0012/0013) maupun fungsi kv_is_per_user_key → alur tulis (cloud-
-- sync, rate-limit) tak berubah. Pakai `(select auth.uid())` (rak supabase-prisma
-- §2.1: dihitung sekali per query, ringan di tabel besar).
--
-- Idempotent. Run via Supabase Dashboard → SQL Editor (BUKAN CLI). PRE-FLIGHT dulu.

-- ============================================================
-- PRE-FLIGHT (read-only — jalankan sebagai authenticated user biasa/non-admin)
-- ============================================================
-- Baris PII yang SEKARANG bocor ke user login (harus jadi 0 setelah apply).
-- (account-* sudah ditutup oleh klausa `not kv_is_per_user_key(key)`; admin-*/
--  trash-videos SENGAJA tak diblokir — lihat catatan di bagian MIGRATION.)
--   select key from public.kv
--   where user_id is null
--     and ( key like 'playly-login-attempts-%'
--        or key like 'playly-sessions-%'
--        or key like 'playly-user-audit-%'
--        or key like 'playly-daily-snapshot-%'
--        or key like 'playly-video-snapshot-%' )
--   order by key;

-- ============================================================
-- MIGRATION — perketat kv_per_user_select (authenticated)
-- ============================================================
drop policy if exists "kv_per_user_select" on public.kv;
create policy "kv_per_user_select" on public.kv
  for select
  to authenticated
  using (
    -- 1) Baris milik sendiri: selalu boleh.
    (select auth.uid()) = user_id
    -- 2) Platform-config publik: user_id NULL, BUKAN kunci per-user, BUKAN PII.
    or (
      user_id is null
      and not public.kv_is_per_user_key(key)
      -- PII per-user yatim (user_id NULL) — blokir baca lintas-user.
      -- CATATAN penting: sessions/user-audit/daily/video-snapshot KINI di-stamp
      -- user_id via bridge (cloud-sync.js PER_USER_PREFIXES_BRIDGE) → baris milik
      -- sendiri lolos lewat cabang (auth.uid()=user_id) di atas; denylist ini
      -- hanya menutup baris YATIM lama (akun terhapus / pra-stamp), jadi TIDAK
      -- memutus baca-sendiri lintas-perangkat.
      and key not like 'playly-login-attempts-%'
      and key not like 'playly-sessions-%'
      and key not like 'playly-user-audit-%'
      and key not like 'playly-daily-snapshot-%'
      and key not like 'playly-video-snapshot-%'
    )
  );
-- SENGAJA TIDAK memblokir playly-admin-tickets/targets/revoked & playly-trash-
-- videos di sini (beda dari denylist anon 0015): key admin ini TIDAK di-stamp
-- user_id (bukan per-user) → dibaca ADMIN lewat cabang platform (user_id NULL)
-- saat cloud-sync. Memblokirnya di sini akan MEMATAHKAN sinkron panel admin
-- (Support Tickets / Target Bulanan / daftar admin dicabut / Sampah video)
-- lintas-perangkat. Batas jujur: akibatnya, baris admin ini MASIH bisa dibaca
-- user login mana pun (bukan hanya admin) — celah privasi RINGAN yang SUDAH ADA
-- sebelum migrasi ini (bukan regresi). Fix bersihnya = stamp user_id ke key
-- admin ATAU pindahkan baca data admin ke server route super-admin (service_role).
-- Dikerjakan terpisah supaya migrasi ini tak sekaligus merusak fitur admin.

-- CATATAN: kv_per_user_insert/update/delete (0008) + kv_anon_* (0012/0013/0015)
-- TIDAK diubah. Hanya jalur BACA authenticated yang diperketat, simetris 0015.

-- ============================================================
-- POST-VERIFY (sebagai authenticated user NON-admin)
-- ============================================================
-- 1) PII tak kebaca lagi (target: []):
--    fetch('<SUPABASE_URL>/rest/v1/kv?select=key&key=like.playly-login-attempts-*',
--      { headers:{ apikey:'<publishable>', authorization:'Bearer <USER_ACCESS_TOKEN>' } })
--      .then(r=>r.json()).then(d=>console.log('login-attempts authed (expect []):', d));
--    -- ulangi utk playly-account-*, playly-sessions-*, playly-user-audit-*
-- 2) Config publik MASIH kebaca (target: ada isi) — mis. playly-ad-config.
-- 3) Data sendiri MASIH kebaca (playly-state-<username sendiri>).
-- 4) Buka app: login, dashboard, /watch normal — tak ada error baru.
-- 5) PANEL ADMIN (login admin, perangkat berbeda kalau bisa): Support Tickets,
--    Target Bulanan, daftar admin, Sampah video — pastikan MASIH terisi dari
--    cloud (bukti key admin tak ikut terblokir).

-- ============================================================
-- ROLLBACK (kalau ada fitur authenticated yang rusak)
-- ============================================================
-- drop policy if exists "kv_per_user_select" on public.kv;
-- create policy "kv_per_user_select" on public.kv
--   for select to authenticated
--   using ( user_id is null or auth.uid() = user_id );
-- -- (kembali ke 0008 — CATATAN: membuka lagi kebocoran PII; segera re-apply.)

-- ============================================================
-- (OPSIONAL, MEDIUM-1) Denylist → allowlist untuk baca anon.
-- BELUM diterapkan di sini karena berisiko: allowlist yang melewatkan satu kunci
-- config publik akan MEMUTUS halaman publik (mis. /watch baca playly-ad-config).
-- Kalau mau menaikkan postur: jalankan dulu inventaris kunci publik yang BENAR
-- dibaca anon (PRE-FLIGHT B di 0015), susun daftar pasti, baru ganti
-- kv_anon_platform_read jadi `user_id is null and key = any(array[...allowlist...])`.
-- Kerjakan sebagai migration terpisah setelah daftar publik terverifikasi.
-- ============================================================
-- DONE.
-- ============================================================
