#!/usr/bin/env node
/**
 * migrasi-ke-playly2.mjs — terapkan file migrasi Playly ke schema `playly2`
 * di database BERSAMA tim (project Supabase tim).
 *
 * KENAPA ADA: selama masa transisi, tiap perubahan STRUKTUR database harus
 * masuk ke DUA tempat — (1) DB lama Playly, (2) schema playly2 di DB tim.
 * Skrip ini mengurus yang (2) secara otomatis, dan menyiapkan berkas untuk (1).
 *
 * PAKAI:
 *   node scripts/migrasi-ke-playly2.mjs supabase/migrations/0016_xxx.sql          -> SIMULASI (default, tak mengubah apa pun)
 *   node scripts/migrasi-ke-playly2.mjs supabase/migrations/0016_xxx.sql --jalankan  -> BENAR-BENAR dijalankan
 *
 * KREDENSIAL: dibaca dari berkas catatan (default: notepad "set claude.txt").
 *   Bisa ditimpa: PLAYLY2_CREDS="C:/path/ke/creds.txt"
 *   Password TIDAK pernah dicetak ke layar.
 *
 * BERKAS KELUARAN: default `<folder-proyek>/.migrasi-playly2/` (ikut .gitignore).
 *   Bisa ditimpa: PLAYLY2_OUTDIR="D:/path/ke/folder"
 *   (Dulu dipatok mati ke folder pribadi user15 -> alat MATI di komputer lain.)
 *
 * PAGAR KEAMANAN (menolak menjalankan kalau dilanggar):
 *   1. Tak boleh ada sisa `public.`   -> mencegah menulis ke schema UMUM bersama
 *      (tak peka huruf besar/kecil + tanda kutip dibuka dulu, jadi `PUBLIC.` dan
 *       `"public".` ikut kecegat — dulu dua-duanya lolos)
 *   2. Tak boleh menyentuh schema tim lain (goteam, pbn, landing, dst)
 *   3. Tak boleh menyentuh `storage.` -> storage di project tim dipakai BERSAMA
 *   4. Tak boleh perintah berbahaya (drop schema/database/role, alter role, dst)
 *   5. Tak boleh MENULIS ke `auth.*` (delete/insert/update/truncate/alter/drop)
 *      -> `auth.users` = buku-daftar-login SATU project, dipakai SEMUA tim.
 *         Membaca (`auth.uid()`) TETAP BOLEH — dipakai migrasi 0001/0004/0005/0008/0012.
 *   6. Berkas migrasi tak boleh `set role` / `set search_path` sendiri
 *      -> kalau boleh, pagar schema di atas bisa dilewati.
 *   + Semua dijalankan dalam 1 transaksi: gagal di tengah -> dibatalkan total (rollback).
 */
import fs from 'node:fs';
import net from 'node:net';
import tls from 'node:tls';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

const SCHEMA = 'playly2';
const ROLE = 'tim_playly2';
const CREDS = process.env.PLAYLY2_CREDS || 'D:/Users/user15/Documents/All Notepad file/set claude.txt';

// ---------- schema yang HARAM disentuh (milik tim lain / dipakai bersama) ----------
const SCHEMA_TERLARANG = [
  'public', 'storage', 'vault', 'realtime', 'graphql', 'graphql_public', 'pgbouncer',
  'supabase_migrations', 'playly', 'goteam', 'pbn', 'landing', 'landinglx', 'netizenid',
  'rtp', 'seoanalysis', 'twitterdood', 'footballbot', 'email', 'gitver', 'mappingplan',
  'redirectseo', 'reportphising',
];
const PERINTAH_TERLARANG = [
  /\bdrop\s+schema\b/i, /\bdrop\s+database\b/i, /\bcreate\s+role\b/i, /\balter\s+role\b/i,
  /\bdrop\s+role\b/i, /\bcreate\s+extension\b/i, /\balter\s+system\b/i, /\bdrop\s+owned\b/i,

  // --- MENULIS ke `auth.*` = HARAM ---------------------------------------------
  // `auth.users` itu buku-daftar-login SATU project Supabase — dipakai SEMUA tim,
  // tidak dipisah per-schema. Menghapus di sini = menghapus akun tim lain juga.
  // CATATAN: `auth.uid()` (baca siapa yang login) TETAP BOLEH — dipakai 5 migrasi sah
  // (0001, 0004, 0005, 0008, 0012). Yang dilarang cuma MENULIS/MENGUBAH.
  // `\s*\.` menoleransi trik spasi `auth . users`; UPDATE tak lagi menuntut `set` kontigu
  // (dulu `UPDATE auth.users AS u SET ...` lolos). COPY ... FROM = jalur tulis massal.
  /\bdelete\s+from\s+(only\s+)?auth\s*\./i,
  /\binsert\s+into\s+(only\s+)?auth\s*\./i,
  /\bupdate\s+(only\s+)?auth\s*\.\s*\w+/i,
  /\btruncate\s+(table\s+)?(only\s+)?auth\s*\./i,
  /\b(alter|drop)\s+table\s+(if\s+exists\s+)?(only\s+)?auth\s*\./i,
  /\bcopy\s+(only\s+)?auth\s*\.\s*\w+\s+from\b/i,

  // --- berkas migrasi TIDAK BOLEH mengatur peran/jalur-cari sendiri -------------
  // Skrip ini yang mengurusnya (baris `set role` + `set search_path` di bawah).
  // Kalau berkas migrasi boleh menimpanya, pagar schema di atas bisa dilewati
  // (mis. `reset role; set search_path to public; create table ...`).
  /\bset\s+search_path\b/i,
  /\b(set|reset)\s+role\b/i,
];

const argv = process.argv.slice(2);
const JALANKAN = argv.includes('--jalankan');
const FILE = argv.find((a) => !a.startsWith('--'));

const mati = (m) => { console.error('\n❌ ' + m); process.exit(1); };

if (!FILE) mati('Pakai: node scripts/migrasi-ke-playly2.mjs <berkas.sql> [--jalankan]');
if (!fs.existsSync(FILE)) mati('Berkas tak ditemukan: ' + FILE);

// ---------- 1. baca + adaptasi ----------
const asli = fs.readFileSync(FILE, 'utf8');

let sql = asli
  .replace(/\bpublic\s*\./gi, `${SCHEMA}.`)                               // schema utama (tak peka huruf besar/kecil + toleran spasi)
  .replace(/(?<!\w\.)\bkv_is_per_user_key\(/g, `${SCHEMA}.kv_is_per_user_key(`) // fungsi tanpa schema
  .replace(/EXECUTE\s+FUNCTION\s+(?!\w+\.)(\w+)\(\)/gi, `EXECUTE FUNCTION ${SCHEMA}.$1()`)
  .replace(/^\s*(begin|commit)\s*;\s*$/gim, '');                          // transaksi diurus skrip

// ---------- 2. PAGAR KEAMANAN ----------
const langgar = [];
const bersih = sql
  .replace(/--[^\n]*/g, ' ')
  .replace(/\/\*[\s\S]*?\*\//g, ' ')   // buang komentar
  .replace(/"(\w+)"\s*\./g, '$1.');    // buka tanda kutip: "public".kv -> public.kv (biar tak bisa nyelinap)

// Cek NAMA SCHEMA terlarang — GAGAL-MENUTUP: pakai `bersih` (isi tanda petik UTUH),
// supaya schema tim lain DI DALAM SQL-dinamis (mis. execute 'create table goteam.x')
// TETAP kecegat. Lookbehind (?<![\w@.]) mencegah alarm palsu dari email/URL yang kebetulan
// memuat nama schema — mis. 'cantika@playly.app' TIDAK dianggap schema `playly.`
// (playly didahului '@'). `\s*\.` menoleransi trik spasi `goteam .x`.
//
// CATATAN PENTING (jangan over-percaya pagar teks ini): saringan regex di berkas ini
// = LAPIS TAMBAHAN / peringatan-dini. PERTAHANAN UTAMA = peran DB `tim_playly2`, yang
// SUDAH DIVERIFIKASI (2026-07-14) hanya boleh CREATE/tulis di schema `playly2` dan tak
// bisa bahkan MASUK schema auth/storage/tim-lain (has_schema_privilege CREATE=false,
// USAGE auth=false, rolbypassrls=false). Jadi celah teks apa pun tetap dibentengi database.
if (/\bpublic\s*\./i.test(bersih)) langgar.push('Masih ada rujukan `public.` — bisa menulis ke schema UMUM bersama.');
for (const s of SCHEMA_TERLARANG) {
  if (s === 'public') continue;
  if (new RegExp(`(?<![\\w@.])${s}\\s*\\.`, 'i').test(bersih)) langgar.push(`Menyentuh schema TERLARANG \`${s}.\` (milik tim lain / bersama).`);
}
for (const re of PERINTAH_TERLARANG) {
  const m = bersih.match(re);
  if (m) langgar.push(`Perintah berbahaya terdeteksi: \`${m[0].trim()}\`.`);
}

// ---------- 3. ringkasan ----------
const hitung = (re) => (bersih.match(re) || []).length;
console.log('='.repeat(64));
console.log('MIGRASI -> schema ' + SCHEMA + ' (database BERSAMA tim)');
console.log('='.repeat(64));
console.log('Berkas   : ' + FILE);
console.log('Mode     : ' + (JALANKAN ? '⚠️  JALANKAN SUNGGUHAN' : '🔍 SIMULASI (tak mengubah apa pun)'));
console.log('\nYang akan dilakukan:');
console.log('  create table   : ' + hitung(/create\s+table/gi));
console.log('  alter table    : ' + hitung(/alter\s+table/gi));
console.log('  create index   : ' + hitung(/create\s+index/gi));
console.log('  create policy  : ' + hitung(/create\s+policy/gi));
console.log('  create function: ' + hitung(/create\s+(or\s+replace\s+)?function/gi));
console.log('  create trigger : ' + hitung(/create\s+trigger/gi));
console.log('  grant          : ' + hitung(/\bgrant\b/gi));

// ---------- 4. VONIS PAGAR — HARUS sebelum menulis berkas apa pun ----------
// KENAPA urutan ini penting: dulu berkas hasil ditulis DULU, baru pagar memvonis.
// Akibatnya berkas migrasi yang DITOLAK tetap tercipta di disk dan terlihat
// "siap tempel" — kalau ada yang menempelkannya manual ke SQL Editor, seluruh
// pagar ini terlewati. Sekarang: ditolak = NOL berkas ditulis.
if (langgar.length) {
  console.log('\n' + '!'.repeat(64));
  console.log('🚨 PAGAR KEAMANAN MENOLAK — migrasi TIDAK dijalankan:');
  langgar.forEach((l) => console.log('   • ' + l));
  console.log('!'.repeat(64));
  console.log('\nPerbaiki berkas migrasinya dulu. (Ini DB BERSAMA — pagar ini melindungi tim lain.)');
  console.log('Tidak ada berkas hasil yang ditulis — supaya tak ada yang mengira berkas ini');
  console.log('"sudah lolos" lalu menempelkannya manual ke SQL Editor.');
  process.exit(1);
}
console.log('\n✅ Pagar keamanan LULUS (tak menyentuh schema lain / perintah berbahaya).');

// ---------- 5. simpan berkas hasil (HANYA kalau pagar LULUS) ----------
const outDir = process.env.PLAYLY2_OUTDIR || path.join(process.cwd(), '.migrasi-playly2');
fs.mkdirSync(outDir, { recursive: true });
const namaDasar = path.basename(FILE, '.sql');
const fileLama = path.join(outDir, namaDasar + '__UNTUK-DB-LAMA.sql');
const filePlayly2 = path.join(outDir, namaDasar + '__UNTUK-playly2.sql');
fs.writeFileSync(fileLama, asli, 'utf8');
fs.writeFileSync(filePlayly2, `-- adaptasi otomatis ke schema ${SCHEMA}\nset role ${ROLE};\nset search_path to ${SCHEMA};\nbegin;\n${sql.trim()}\ncommit;\n`, 'utf8');
console.log('\nBerkas disiapkan:');
console.log('  DB LAMA  (tempel ke SQL Editor project-mu) : ' + fileLama);
console.log('  playly2  (dijalankan skrip ini)            : ' + filePlayly2);

if (!JALANKAN) {
  console.log('\n🔍 SIMULASI selesai — NOL perubahan dilakukan.');
  console.log('   Kalau sudah yakin, ulangi dengan:  --jalankan');
  process.exit(0);
}

// ---------- 5. koneksi (terowongan proxy + TLS) ----------
const raw = fs.readFileSync(CREDS, 'utf8');
const amb = (re) => { const m = raw.match(re); return m ? m[1].trim() : null; };
const HOST = amb(/^Host\s*:\s*(\S+)/m);
const USER = amb(/^Username\s*:\s*(\S+)/m);
const DB = amb(/^Database\s*:\s*(\S+)/m) || 'postgres';
const PORT = 5432; // jalur DDL
const PASS = raw.split(/\r?\n/).map((l) => (l.match(/^Password\s*:\s*(.+)$/) || [])[1])
  .filter(Boolean).map((s) => s.trim()).filter((s) => !s.startsWith('['))[0];
if (!HOST || !USER || !PASS) mati('Kredensial tak lengkap di: ' + CREDS);

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (!proxyUrl) mati('Tak ada HTTPS_PROXY — koneksi ke DB tim butuh terowongan proxy.');
const pu = new URL(proxyUrl);

const terowongan = () => new Promise((res, rej) => {
  const s = net.connect(Number(pu.port), pu.hostname, () => s.write(`CONNECT ${HOST}:${PORT} HTTP/1.1\r\nHost: ${HOST}:${PORT}\r\n\r\n`));
  let b = '';
  const od = (c) => {
    b += c.toString('latin1');
    const i = b.indexOf('\r\n\r\n'); if (i === -1) return;
    s.removeListener('data', od);
    if (!/\s200\s/.test(b.split('\r\n')[0])) { s.destroy(); return rej(new Error('proxy menolak CONNECT')); }
    const r = Buffer.from(b.slice(i + 4), 'latin1'); if (r.length) s.unshift(r);
    res(s);
  };
  s.on('data', od); s.on('error', rej);
  s.setTimeout(25000, () => { s.destroy(); rej(new Error('timeout ke proxy')); });
});

const mulaiTls = (sock) => new Promise((res, rej) => {
  const q = Buffer.alloc(8); q.writeInt32BE(8, 0); q.writeInt32BE(80877103, 4); sock.write(q);
  sock.once('data', (b) => {
    if (b.toString('utf8', 0, 1) !== 'S') return rej(new Error('server menolak SSL'));
    const t = tls.connect({ socket: sock, servername: HOST, rejectUnauthorized: false }, () => res(t));
    t.on('error', rej);
  });
  sock.on('error', rej);
});
const asPg = (t) => { t.connect = function () { process.nextTick(() => t.emit('connect')); return t; }; return t; };

console.log('\n' + '='.repeat(64));
console.log('⚠️  MENJALANKAN SUNGGUHAN ke database BERSAMA tim...');

const t = await mulaiTls(await terowongan());
const c = new Client({ user: USER, password: PASS, database: DB, host: HOST, port: PORT, ssl: false, stream: () => asPg(t) });
await c.connect();
console.log('✅ Tersambung.');

await c.query(`set role ${ROLE}`);
await c.query(`set search_path to ${SCHEMA}`);

try {
  await c.query('begin');
  await c.query(sql);
  await c.query('commit');
  console.log('✅ MIGRASI BERHASIL (transaksi di-commit).');
} catch (e) {
  await c.query('rollback').catch(() => {});
  await c.end();
  mati('MIGRASI GAGAL → SEMUA DIBATALKAN (rollback). Pesan: ' + e.message);
}

// ---------- 6. verifikasi ----------
const tabel = await c.query(
  "select table_name from information_schema.tables where table_schema=$1 order by 1", [SCHEMA]);
console.log('\nTabel di ' + SCHEMA + ' sekarang: ' + tabel.rows.map((r) => r.table_name).join(', '));
await c.end();

console.log('\n' + '='.repeat(64));
console.log('SELESAI. JANGAN LUPA: jalankan juga versi DB LAMA di SQL Editor project-mu:');
console.log('  ' + fileLama);
console.log('='.repeat(64));
