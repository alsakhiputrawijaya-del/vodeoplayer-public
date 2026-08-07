-- Profiles email PII lockdown — audit HIGH-1 (2026-08-07).
--
-- MASALAH (GENTING): policy `profiles_public_read` (migration 0004) memberi
-- anon + authenticated SELECT ke SEMUA baris profiles `using (true)`. RLS itu
-- per-BARIS, bukan per-KOLOM — jadi kolom `email` (PII) ikut kebaca. Kunci
-- publishable ada di browser (public/legacy/index-config.js), maka SIAPA PUN
-- tanpa login bisa menyedot SELURUH email user:
--   GET <SUPABASE_URL>/rest/v1/profiles?select=email,username,tier
-- → daftar email untuk spam/phishing. Endpoint /api/admin/list-users sudah
-- menyembunyikan email di balik auth admin, tapi jadi sia-sia karena tabelnya
-- bisa dibaca langsung via anon key.
--
-- FAKTA yang bikin fix ini AMAN: TIDAK ada kode browser yang query `profiles`
-- (dicek 2026-08-07: semua akses profiles ada di server route pakai service_role
-- — auth/bridge, profile/me, profile/tier, admin/*). Fitur discover/search-creator
-- TIDAK membaca profiles dari client. Jadi memperketat kolom email TIDAK
-- merusak UI mana pun.
--
-- PENDEKATAN (selaras rak supabase-prisma "anti bocor kolom"): proteksi tingkat-
-- KOLOM. Cabut SELECT tabel dari anon+authenticated, lalu beri SELECT hanya ke
-- kolom non-sensitif (semua KECUALI email). RLS baris (profiles_public_read)
-- TIDAK diubah → baris tetap "publik" untuk discover, tapi email tak bisa diminta.
-- service_role (server) punya BYPASSRLS + grant penuh → TIDAK terpengaruh, jadi
-- login/admin tetap jalan.
--
-- Idempotent. Run via Supabase Dashboard → SQL Editor (BUKAN CLI).

-- ============================================================
-- PRE-FLIGHT (read-only — jalankan + tinjau dulu)
-- ============================================================
-- A) Buktikan email SEKARANG bocor ke anon (harus ada isi SEBELUM apply).
--    Jalankan di browser incognito pakai ANON/publishable key:
--    fetch('<SUPABASE_URL>/rest/v1/profiles?select=email',
--      { headers:{ apikey:'<publishable>', authorization:'Bearer <publishable>' } })
--      .then(r=>r.json()).then(d=>console.log('email anon SEBELUM (bocor):', d));
--
-- B) Konfirmasi tak ada kolom lain yang mau dipublik terlewat:
--    select column_name from information_schema.columns
--    where table_schema='public' and table_name='profiles' order by ordinal_position;
--    -- Pastikan daftar GRANT di bawah = semua kolom KECUALI email.

-- ============================================================
-- MIGRATION — proteksi kolom email
-- ============================================================
-- 1) Cabut SELECT tabel (semua kolom) dari peran publik.
revoke select on public.profiles from anon, authenticated;

-- 2) Beri lagi SELECT HANYA kolom non-sensitif (tanpa email).
--    Discover/search-creator/public-profile butuh username/name/bio/avatar/tier.
grant select (
  id, username, name, bio, avatar_url, tier, joined_at, created_at, updated_at
) on public.profiles to anon, authenticated;

-- CATATAN: policy RLS baris (profiles_public_read/owner_insert/update/delete dari
-- 0004) TIDAK diubah. Grant kolom + RLS baris berlaku BERSAMA: anon/authenticated
-- boleh baca baris mana pun TAPI hanya kolom yang di-grant. `select=email` atau
-- `select=*` oleh anon/authenticated → error/permission denied (aman).

-- ============================================================
-- POST-VERIFY (jalankan sebagai anon — incognito, publishable key)
-- ============================================================
-- 1) Email TIDAK bisa dibaca lagi (target: error/permission denied, BUKAN data):
--    fetch('<SUPABASE_URL>/rest/v1/profiles?select=email',
--      { headers:{ apikey:'<publishable>', authorization:'Bearer <publishable>' } })
--      .then(r=>r.json()).then(d=>console.log('email anon SESUDAH (expect error):', d));
--
-- 2) Kolom publik MASIH kebaca (target: ada isi — discover tetap jalan):
--    fetch('<SUPABASE_URL>/rest/v1/profiles?select=username,name,tier&limit=5',
--      { headers:{ apikey:'<publishable>', authorization:'Bearer <publishable>' } })
--      .then(r=>r.json()).then(d=>console.log('profil publik (expect isi):', d));
--
-- 3) Buka app: login, Cari Kreator, halaman profil publik — pastikan tak ada
--    error baru (server route pakai service_role, seharusnya normal).

-- ============================================================
-- ROLLBACK (kalau ada fitur yang rusak setelah apply)
-- ============================================================
-- grant select on public.profiles to anon, authenticated;
-- -- (kembali membuka SEMUA kolom termasuk email — CATATAN: ini membuka lagi
-- --  kebocoran email; segera cari pemakai email lalu re-apply versi kolom.)

-- ============================================================
-- DONE. Verifikasi grant kolom:
--   select grantee, privilege_type, column_name
--   from information_schema.column_privileges
--   where table_schema='public' and table_name='profiles'
--     and grantee in ('anon','authenticated') order by grantee, column_name;
--   -- Harusnya TIDAK ada baris untuk column_name='email'.
-- ============================================================
