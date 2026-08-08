-- Gate key data-admin ke ADMIN saja — follow-up residual audit (2026-08-08).
--
-- MASALAH (residual dari 0018, low-med): key data admin BERSAMA (playly-admin-*,
-- playly-takedowns, playly-pending-videos) tersimpan user_id NULL & disinkron ke
-- semua perangkat lewat cloud-sync (/api/kv/list). Policy saat ini mengizinkan
-- SETIAP user login (termasuk NON-admin) membacanya → Support Tickets (berisi PII
-- pelapor), Target Bulanan, daftar admin (email), takedowns, dll bocor ke user
-- biasa. (0018 sengaja TIDAK memblokirnya supaya sinkron admin tak patah — INI
-- fix bersihnya: blokir untuk non-admin, tetap izinkan admin.)
--
-- FIX: gate key admin via fungsi kv_caller_is_admin() (SECURITY DEFINER) yang
-- MIRROR logika server (app/api/admin/list-users + script.js isAllowedAdminEmail):
--   admin = email == super-admin (PLAYLY_ADMIN_EMAIL, default admin.playly@gmail.com)
--           ATAU (email ADA di playly-admin-allowlist DAN TIDAK di playly-admin-revoked).
-- SECURITY DEFINER = fungsi baca allowlist/revoked + profiles.email TANPA kena RLS
-- → admin-TAMBAHAN tetap bisa "mengenali diri" & baca key admin (tak ada deadlock);
-- non-admin diblok. Deteksi admin di client (isAllowedAdminEmail) baca allowlist/
-- revoked dari localStorage hasil cloud-sync: admin RLS-allow → ter-hydrate (role
-- ke-set); non-admin tak dapat (benar — email-nya memang bukan admin).
--
-- CATATAN: fungsi hard-code 'admin.playly@gmail.com' = default PLAYLY_ADMIN_EMAIL.
-- Kalau owner MENGUBAH env PLAYLY_ADMIN_EMAIL, sesuaikan email di fungsi ini juga.
-- Batas: ini menutup jalur BACA. Sisi TULIS key admin (siapa boleh MENGUBAH tiket/
-- target) belum di-gate di sini — follow-up terpisah (with check kv_caller_is_admin
-- di policy insert/update) agar tak sekaligus berisiko memutus SIMPAN admin.
--
-- Idempotent. Run via Supabase Dashboard → SQL Editor (BUKAN CLI). PRE-FLIGHT dulu.
-- Rak supabase-prisma: SECURITY DEFINER → search_path dikunci + cek auth.uid() di dalam.

-- ============================================================
-- 1. Helper: apakah key = data admin BERSAMA (bukan per-user)
-- ============================================================
create or replace function public.kv_is_admin_only_key(k text)
returns boolean language sql immutable as $$
  select k like 'playly-admin-%'
      or k like 'playly-takedowns%'
      or k like 'playly-pending-videos%';
$$;

-- ============================================================
-- 2. Helper: apakah PEMANGGIL = admin sah (mirror isAllowedAdminEmail)
--    SECURITY DEFINER + search_path terkunci (rak supabase-prisma §3).
-- ============================================================
create or replace function public.kv_caller_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with me as (
    select lower(p.email) as email
    from public.profiles p
    where p.id = (select auth.uid())
  ),
  allow as (
    select array(
      select lower(x) from public.kv k, lateral jsonb_array_elements_text(k.value) x
      where k.key = 'playly-admin-allowlist' and jsonb_typeof(k.value) = 'array'
    ) as emails
  ),
  revoked as (
    select array(
      select lower(x) from public.kv k, lateral jsonb_array_elements_text(k.value) x
      where k.key = 'playly-admin-revoked' and jsonb_typeof(k.value) = 'array'
    ) as emails
  )
  select coalesce((
    select case
      when m.email is null then false
      when m.email = 'admin.playly@gmail.com' then true              -- super-admin
      else (m.email = any(a.emails) and not (m.email = any(r.emails)))-- admin tambahan sah
    end
    from me m, allow a, revoked r
  ), false);
$$;

-- ============================================================
-- PRE-FLIGHT (read-only)
-- ============================================================
-- A) Sebagai user login NON-admin (harus jadi 0 SETELAH apply):
--    select key from public.kv where user_id is null
--      and public.kv_is_admin_only_key(key) order by key;   -- SEBELUM: ada isi (bocor)
-- B) Cek fungsi admin benar (jalankan sebagai super-admin / admin tambahan / non-admin):
--    select public.kv_caller_is_admin();  -- admin → true, non-admin → false

-- ============================================================
-- 3. Update policy SELECT authenticated — gate admin-only key
-- ============================================================
drop policy if exists "kv_per_user_select" on public.kv;
create policy "kv_per_user_select" on public.kv
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (
      user_id is null
      and not public.kv_is_per_user_key(key)
      and key not like 'playly-login-attempts-%'
      and key not like 'playly-sessions-%'
      and key not like 'playly-user-audit-%'
      and key not like 'playly-daily-snapshot-%'
      and key not like 'playly-video-snapshot-%'
      -- key data-admin: HANYA admin yang boleh baca.
      and (not public.kv_is_admin_only_key(key) or public.kv_caller_is_admin())
    )
  );

-- ============================================================
-- 4. Update policy SELECT anon — admin-only TAK PERNAH boleh (anon bukan admin).
--    (Basis = 0015; tambah guard admin-only yang menyeluruh.)
-- ============================================================
drop policy if exists "kv_anon_platform_read" on public.kv;
create policy "kv_anon_platform_read" on public.kv
  for select
  to anon
  using (
    user_id is null
    and not public.kv_is_per_user_key(key)
    and not public.kv_is_admin_only_key(key)
    and key not like 'playly-login-attempts-%'
    and key not like 'playly-sessions-%'
    and key not like 'playly-user-audit-%'
    and key not like 'playly-daily-snapshot-%'
    and key not like 'playly-video-snapshot-%'
    and key not like 'playly-trash-videos%'
  );

-- ============================================================
-- POST-VERIFY
-- ============================================================
-- 1) NON-admin login: key admin TIDAK kebaca (target: []):
--    /rest/v1/kv?select=key&key=like.playly-admin-* dgn session non-admin → []
-- 2) ADMIN login (super & tambahan): key admin MASIH kebaca (target: ada isi) →
--    buka panel admin di perangkat: Support Tickets / Target Bulanan / daftar
--    admin / Sampah — MASIH terisi dari cloud.
-- 3) Anon: key admin [] (harus sudah begitu sejak 0015; kini menyeluruh).
-- 4) App non-admin normal (dashboard/watch) tak ada error baru.

-- ============================================================
-- ROLLBACK (kalau fitur admin lintas-perangkat rusak)
-- ============================================================
-- drop policy if exists "kv_per_user_select" on public.kv;
-- create policy "kv_per_user_select" on public.kv for select to authenticated
--   using ( (select auth.uid()) = user_id or ( user_id is null
--     and not public.kv_is_per_user_key(key)
--     and key not like 'playly-login-attempts-%' and key not like 'playly-sessions-%'
--     and key not like 'playly-user-audit-%' and key not like 'playly-daily-snapshot-%'
--     and key not like 'playly-video-snapshot-%' ) );
-- -- (kembali ke 0018 — admin key kebaca semua authenticated lagi.)
-- -- Fungsi boleh dibiarkan (tak dipakai) atau: drop function public.kv_caller_is_admin();
-- --   drop function public.kv_is_admin_only_key(text);

-- ============================================================
-- DONE.
-- ============================================================
