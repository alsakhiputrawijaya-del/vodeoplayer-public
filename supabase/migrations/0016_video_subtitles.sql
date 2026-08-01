-- Migration 0016 (revisi): video_subtitles — subtitle per video, DECOUPLED dari tabel videos.
-- Jalankan via Supabase Dashboard → SQL Editor → New query → paste all → Run.
--
-- Kenapa decoupled: video existing di app ini disimpan di user_state (JSON) + R2
-- dengan id LEGACY (numerik / "ve-logo-*"), BUKAN di tabel videos ternormalisasi
-- (yg praktis kosong). Maka:
--   - video_id = text apa adanya (bukan uuid + FK ke videos yg tak akan ketemu).
--   - Owner & visibility TIDAK ditegakkan lewat RLS join ke videos, melainkan di
--     route API (service-role) yg meniru /api/public-video: resolve videoId →
--     owner + visibility dari user_state.

-- ============================================================
-- 1. Tabel video_subtitles
-- ============================================================
create table if not exists public.video_subtitles (
  id              uuid primary key default gen_random_uuid(),
  video_id        text not null,                 -- id video apa adanya (legacy/uuid string)
  language        varchar(10) not null default 'id',
  is_original     boolean not null default true,
  cues            jsonb not null default '[]'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  -- Satu video hanya boleh punya satu subtitle per bahasa
  constraint video_subtitles_unique_lang unique (video_id, language)
);

create index if not exists video_subtitles_video_idx on public.video_subtitles(video_id);
create index if not exists video_subtitles_video_lang_idx on public.video_subtitles(video_id, language);

-- ============================================================
-- 2. RLS: default-deny (sengaja TANPA policy).
--    Tabel ini TIDAK diakses langsung dari klien — SEMUA akses lewat route API
--    (service-role, BYPASS RLS) yg menegakkan owner/visibility via user_state.
--    RLS ON + nol policy = deny-total utk anon/authenticated (aman by-default).
--    updated_at di-set oleh route (bukan trigger) supaya tanpa dependency fungsi.
-- ============================================================
alter table public.video_subtitles enable row level security;

-- ============================================================
-- DONE. Verifikasi (opsional, run terpisah):
--   select count(*) from public.video_subtitles;
--   select relrowsecurity from pg_class where relname = 'video_subtitles';  -- harus true
-- ============================================================
