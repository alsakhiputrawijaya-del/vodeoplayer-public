-- Transcoding job queue untuk multi-resolusi video.
-- Worker terpisah (Node.js + ffmpeg) polling tabel ini.

CREATE TABLE IF NOT EXISTS public.video_transcode_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  original_key text,
  variants jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index untuk polling worker: job pending paling lama.
CREATE INDEX IF NOT EXISTS idx_video_transcode_jobs_pending
  ON public.video_transcode_jobs (status, created_at)
  WHERE status = 'pending';

-- Index untuk lookup status per video (client poll).
CREATE INDEX IF NOT EXISTS idx_video_transcode_jobs_video_id
  ON public.video_transcode_jobs (video_id, created_at DESC);

-- RLS: owner bisa baca job sendiri; service role mengubah semua lewat bypass.
ALTER TABLE public.video_transcode_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "video_transcode_jobs_select_own"
  ON public.video_transcode_jobs
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Trigger auto-update updated_at.
CREATE OR REPLACE FUNCTION public.set_updated_at_video_transcode_jobs()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_video_transcode_jobs_updated_at ON public.video_transcode_jobs;
CREATE TRIGGER trg_video_transcode_jobs_updated_at
  BEFORE UPDATE ON public.video_transcode_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_video_transcode_jobs();
