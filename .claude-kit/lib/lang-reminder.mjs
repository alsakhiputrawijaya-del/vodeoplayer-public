#!/usr/bin/env node
// lib/lang-reminder.mjs - Pengingat per-giliran (disuntik ke konteks AI TIAP user kirim pesan):
//   (1) BAHASA      : jawab Bahasa Indonesia + gaya non-programmer (sec.2.1).
//   (2) 8 DIVISI    : pertimbangkan 8 lensa divisi profesional tiap prompt + perketat di titik risiko (sec.4.13/4.17).
//   (3) BLOK BELAJAR: tutup output substantif dengan blok "Belajar dari task ini" (sec.4.1b).
//
// KENAPA: dua aturan ini hanya berupa TEKS yang terkubur jauh di dokumen aturan ~1900 baris. Bawaan model
// = Bahasa Inggris, DAN di bawah beban kerja AI gampang lupa menimbang lensa divisi - jadi di awal sesi
// (sebelum benar-benar menyerap aturan) AI sering "kabur" ke Inggris / mengerjakan permukaan saja.
// Berkas aturan = imbauan; berkas ini = rem-mesin LUNAK: dijalankan harness Claude Code lewat hook
// `UserPromptSubmit`, lalu apa pun yang dicetak ke stdout DITAMBAHKAN ke konteks AI untuk giliran itu -
// posisinya tepat sebelum AI menjawab, jadi jauh lebih kuat daripada teks di awal berkas panjang.
// "LUNAK" = pengingat, BUKAN pemblokir (selalu exit 0): ia MENGUATKAN kepatuhan, tak bisa memaksa.
//
// KENAPA 8 DIVISI IKUT DI SINI (audit 2026-06-28): audit menemukan asimetri - aturan BAHASA sudah diberi
// rem-mesin (hook ini), tapi aturan 8 DIVISI belum, padahal alasannya IDENTIK (teks panjang sering dilupakan
// AI di bawah beban). Menyatukannya di satu hook = REUSE wiring yang sudah terpasang di semua klien (penanda
// idempoten 'lang-reminder.mjs' di lib/lang-hook-wiring.mjs) - tanpa hook/berkas settings baru. Pengingat 8
// divisi sengaja MENEKANKAN "tampilkan pas-ukuran" supaya tak memicu AI meledakkan 15-lensa / mengarang
// temuan untuk hal sepele (lawan sec.4.17 + sec.8.2 Aturan 3b).
//
// WIRING: di repo kit -> .claude/settings.json (tunjuk lib/lang-reminder.mjs). Di project KLIEN ->
// dipasang OTOMATIS ke .claude/settings.json saat init/update oleh lib/lang-hook-wiring.mjs (tunjuk
// .claude-kit/lib/lang-reminder.mjs); contoh bentuk hook = templates/settings.json.template.
//
// SENGAJA SEDERHANA + TAK BISA GAGAL: cuma console.log lalu keluar 0. Tanpa baca berkas, tanpa
// I/O yang bisa melempar. Hook `UserPromptSubmit` yang keluar-kode 2 akan MEMBLOKIR pesan user -
// itu pantang di sini (pengingat tak boleh menghalangi kerja). Maka tak ada yang bisa melempar.
//
// BAHASA INDONESIA WAJIB: teks di bawah dipindai robot penjaga bahasa (lib/output-lang-check.mjs)
// karena berkas ini ada di lib/*.mjs. Kalau ditulis Inggris -> gerbang bahasa merah. Lagipula
// pengingat ke AI memang harus Indonesia: ia jadi "contoh hidup" mode bahasa yang diminta.

// Blok 1 - pengingat BAHASA (jalan TIAP giliran -> sengaja pendek demi hemat token).
// DIET v2.0.0: teks dipangkas ~40% (1.032 -> ~600 char = hemat ~107 token TIAP prompt client)
// tanpa membuang satu pun frasa yang dikunci tests/lang-reminder.test.mjs.
const pengingatBahasa = [
  '[Pengingat lintasAI - bahasa output]',
  'Jawab SELALU Bahasa Indonesia - sejak kalimat pertama, narasi antar-langkah, to-do, laporan.',
  'Gaya junior-programmer + non-programmer: jargon langsung dijelaskan awam; identifier kode',
  'tetap asli. (§2.1 - menimpa bawaan model yang Inggris.)',
]

// Blok 2 - pengingat 8 DIVISI (pertimbangkan SELALU; tampilkan PAS-UKURAN, jangan diledakkan).
const pengingatDivisi = [
  '[Pengingat lintasAI - 8 divisi profesional]',
  'Timbang otomatis 8 lensa: Backend, Frontend, Database, Webdesign, UI/UX, DevOps, Security, SEO;',
  'perketat saat sentuh login/bayar/data-pribadi/upload/skema-DB/rilis (§4.13/§4.17).',
  'Tampilkan pas-ukuran: blok Tinjauan HANYA saat ada temuan nyata/keputusan besar,',
  'jangan ledakkan 13 lensa, nol temuan itu sah (§4.1/§8.2).',
]

// Blok 3 - pengingat BLOK BELAJAR (sec.4.1b) - jalan TIAP giliran, sengaja ringkas demi diet token:
// detail aturan (5 baris, label, daftar SKIP) sudah hidup di mandat sec.4.1b yang always-load,
// jangan diulang di sini. Ukuran blok ini ~236 char ~ ~59 token/prompt (rasio kit 4 char/token,
// selaras lib/rules-budget-check.mjs; angka dihitung nyata via .length saat dipasang 2026-07-14).
const pengingatBelajar = [
  '[Pengingat lintasAI - blok belajar]',
  'Tutup output substantif dengan blok "📚 Belajar dari task ini" (5 baris §4.1b:',
  '👨‍🎓 Junior-<profesi> s/d 🚀 jalan ke senior); balasan 1-2 baris & Mode Hemat dilewati;',
  'ragu -> jangan ngarang (§8.2).',
]

console.log([...pengingatBahasa, '', ...pengingatDivisi, '', ...pengingatBelajar].join('\n'))
// process.exitCode (bukan process.exit) = aman dari stdout ke-potong. 0 = jangan blokir pesan user.
process.exitCode = 0
