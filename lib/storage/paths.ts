// Konvensi path objek video di Supabase Storage — SATU sumber kebenaran.
//
// KENAPA DIPUSATKAN: sebelumnya ada tiga konvensi berbeda untuk file yang sama —
// browser menulis "<id>.mp4", policy RLS mensyaratkan "<owner_id>/<id>.mp4", dan
// worker memakai "videos/<id>.mp4". Yang browser tulis selalu ditolak RLS, dan
// yang worker tulis lolos hanya karena service role menembus RLS, bukan karena
// path-nya benar. Sekali konvensi tersebar di banyak berkas, ketidakcocokan
// seperti itu tidak terlihat sampai ada yang memeriksa bucket-nya langsung.
//
// Bentuk baku (disyaratkan policy videos_storage_insert_own di migration 0001):
//   asli    : {owner_id}/{video_id}.{ext}
//   variant : {owner_id}/{video_id}_{tinggi}p.{ext}
//
// Worker transcoder punya salinan logika ini di workers/transcoder/index.mjs —
// paket terpisah, tidak bisa mengimpor modul TypeScript ini. Kalau bentuk di
// sini berubah, ubah di sana juga.

export const VIDEO_BUCKET = 'videos';

export function extFromContentType(contentType?: string | null): string {
  const ct = String(contentType || '').toLowerCase();
  if (ct.includes('webm')) return 'webm';
  if (ct.includes('quicktime') || ct.includes('mov')) return 'mov';
  if (ct.includes('matroska')) return 'mkv';
  return 'mp4';
}

// Id dipakai sebagai nama berkas, jadi karakter di luar daftar aman dibuang —
// mencegah id "../" keluar dari folder pemiliknya.
function idAman(id: string | number): string {
  return String(id).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80) || 'unknown';
}

export function videoStorageKey(
  ownerId: string,
  id: string | number,
  contentType?: string | null,
): string {
  return `${ownerId}/${idAman(id)}.${extFromContentType(contentType)}`;
}

export function variantStorageKey(
  ownerId: string,
  id: string | number,
  height: number,
  contentType?: string | null,
): string {
  return `${ownerId}/${idAman(id)}_${height}p.${extFromContentType(contentType)}`;
}
