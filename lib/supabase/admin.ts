// Service-role Supabase client — HANYA untuk server (Route Handler).
//
// Dipakai untuk operasi admin yang butuh bypass RLS + Supabase Auth Admin API
// (mis. membuat akun di auth.users TANPA mengubah sesi pemanggil). Berbeda dari
// lib/supabase/server.ts yang pakai anon-key + cookie sesi pemanggil.
//
// ⚠️ JANGAN PERNAH meng-import file ini ke kode client/browser — service-role key
// = "kunci induk" yang mem-bypass semua keamanan. Hanya boleh di server.
//
// Butuh env `SUPABASE_SERVICE_ROLE_KEY` (Vercel → Settings → Environment Variables).
// Kalau belum di-set, createAdminClient() return null → caller memperlakukannya
// sebagai "service unavailable" (bukan crash).

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
