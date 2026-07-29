#!/usr/bin/env node
// engine/lang-reminder.mjs - Pengingat per-giliran (disuntik ke konteks AI TIAP user kirim pesan):
//   (1) BAHASA       : jawab Bahasa Indonesia + gaya non-programmer + istilah programming term-first (§1).
//   (2) TITIK RISIKO : perketat pemeriksaan di area berbahaya + lapor jujur/anti-karang-temuan (§4.2/§4.5).
//
// KENAPA: aturan-aturan ini hanya berupa TEKS yang terkubur jauh di dokumen aturan ~1900 baris. Bawaan model
// = Bahasa Inggris, DAN di bawah beban kerja AI gampang lupa memperketat di area berbahaya - jadi di awal
// sesi (sebelum benar-benar menyerap aturan) AI sering "kabur" ke Inggris / mengerjakan permukaan saja.
// Berkas aturan = imbauan; berkas ini = rem-mesin LUNAK: dijalankan harness Claude Code lewat hook
// `UserPromptSubmit`, lalu apa pun yang dicetak ke stdout DITAMBAHKAN ke konteks AI untuk giliran itu -
// posisinya tepat sebelum AI menjawab, jadi jauh lebih kuat daripada teks di awal berkas panjang.
// "LUNAK" = pengingat, BUKAN pemblokir (selalu exit 0): ia MENGUATKAN kepatuhan, tak bisa memaksa.
//
// DUA BLOK PENGINGAT tiap giliran (LUNAK, tak memblokir):
// blok-1 = BAHASA (Indonesia non-programmer) - SELALU, blok-2 = TITIK RISIKO + LAPOR JUJUR -
// (a) perketat di area berbahaya (login/bayar/data-pribadi/upload/skema-DB/rilis, §4.2) dan
// (b) rem anti-karang-temuan ("nol temuan itu sah", §4.5). Keduanya PAGAR, bukan ritual/checklist.
//
// blok-2 KONDISIONAL sejak 2026-07-25 (hemat token: ~58 tok/giliran yang dilewati). ARAH GAGAL KE SISI
// AMAN - dilewati HANYA atas BUKTI POSITIF "topik dikenali & tak ada yang rawan": ada rak cocok TAPI
// tak satu pun bertanda 🔒. Apa pun selain itu (prompt tak terbaca / tak ada rak cocok / penangkap-umum /
// registry hilang / error) -> TETAP DICETAK. Konsekuensi yang disengaja: 7 tes pengunci lama tetap hijau
// APA ADANYA (nol pelemahan) - mereka menjalankan hook tanpa prompt, jalur yang tetap mencetak.
//
// WIRING: di repo kit -> .claude/settings.json (tunjuk engine/lang-reminder.mjs). Di project KLIEN ->
// dipasang OTOMATIS ke .claude/settings.json saat init/update oleh engine/lang-hook-wiring.mjs (tunjuk
// .lintasai/engine/lang-reminder.mjs); contoh bentuk hook = templates/settings.json.template.
//
// SENGAJA SEDERHANA + FAIL-SAFE: 2 blok lama SELALU dicetak DULU (degradasi anggun), BARU coba
// baca stdin untuk blok-4 kondisional plan-mode. Satu-satunya I/O = baca stdin ber-jaring:
// isTTY-null (anti-hang run manual) + try/catch-null + buang-BOM. Apa pun yang aneh -> null ->
// perlaku persis seperti dulu (blok-4 absen). Asumsi desain: harness Claude Code MENUTUP stdin
// setelah kirim JSON (kalau tidak, hang dibatasi timeout:15 di engine/lang-hook-wiring.mjs; exit
// timeout != 2 jadi pesan user tak terblokir). Hook keluar-kode 2 MEMBLOKIR pesan user - pantang;
// selalu exit 0.
//
// BAHASA INDONESIA WAJIB: teks di bawah = output ke user (aturan bahasa AGENTS.md §1)
// karena berkas ini ada di engine/*.mjs. Kalau ditulis Inggris -> gerbang bahasa merah. Lagipula
// pengingat ke AI memang harus Indonesia: ia jadi "contoh hidup" mode bahasa yang diminta.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NAMA_FOLDER_KIT } from './project-root.mjs'

// Blok 1 - pengingat BAHASA (jalan TIAP giliran -> sengaja pendek demi hemat token).
// DIET v2.0.0: teks dipangkas ~40% (1.032 -> ~600 char) tanpa membuang frasa yang dikunci
// tests/lang-reminder.test.mjs. ADR-028: mandat "mau ngapain + kenapa singkat" (narasi/todo/jawaban/
// popup). REV §1.6: diperkuat jadi 3-hal "apa maksudnya + kenapa + langkah selanjutnya" dgn bahasa mudah
// dimengerti (angkat non-programmer -> junior) - tetap ~5 baris (biaya token per-prompt nyaris tak berubah).
const pengingatBahasa = [
  '[Pengingat lintasAI - bahasa output]',
  'Jawab SELALU Bahasa Indonesia (narasi, to-do, jawaban, popup). Tiap info - walau aslinya programming -',
  'jelaskan "apa maksudnya + kenapa + langkah selanjutnya" SINGKAT & mudah dimengerti, biar',
  'non-programmer paham & naik kelas ke junior. Istilah programming DIPERTAHANKAN + gloss awam sekali di',
  'kemunculan pertama (junior belajar konsep); JANGAN parafrase; identifier asli. (§1 - timpa bawaan Inggris.)',
]

// Blok 2 - pengingat TITIK RISIKO + LAPOR JUJUR. Dua pagar:
// (a) perketat di area berbahaya (§4.2), (b) rem anti-karang-temuan (§4.5) + anti-teater
// (jangan ledakkan 10 lensa untuk hal sepele). Yang ada di sini murni PAGAR, bukan ritual/checklist.
const pengingatRisiko = [
  '[Pengingat lintasAI - titik risiko + lapor jujur]',
  'Perketat pemeriksaan saat menyentuh login/bayar/data-pribadi/upload/skema-DB/rilis (§4.2).',
  'Tampilkan pas-ukuran: blok Tinjauan HANYA saat ada temuan nyata/keputusan besar,',
  'jangan ledakkan 10 lensa, nol temuan itu sah (§4.5/§2.2).',
]

// (Blok 3 "BLOK BELAJAR" DIHAPUS 2026-07-20, ADR-026 — fitur Blok Belajar dicabut;
// yang tersisa jalan-tiap-giliran = 2 blok pagar: BAHASA + TITIK RISIKO.)

// Blok 4 - pengingat PLAN MODE (§4.4) - HANYA saat harness melapor permission_mode "plan".
// Rencana cepat-akurat: pasangan 2-versi + klaim berbukti; jangan fan-out kecuali diminta/titik-risiko.
const pengingatPlanMode = [
  '[Pengingat lintasAI - plan mode]',
  'Sedang PLAN MODE: sajikan rencana format §4.4 - pasangan 👨‍🎓 Junior-<profesi> + 🙂 Non-<profesi>',
  'per seksi utama; tiap klaim berbukti berkas:baris, pisah ✅ terverifikasi vs ❓ asumsi (§4.1);',
  'Pindai Cepat: JANGAN fan-out agen kecuali diminta menyeluruh/audit ATAU rencana sentuh titik',
  'risiko (login/bayar/data pribadi/skema DB - §4.2); ragu -> jangan ngarang (§2.2).',
]

// Baca konteks hook dari stdin (JSON dari harness, memuat permission_mode). FAIL-SAFE: apa pun
// yang aneh -> null (= perlakukan seperti BUKAN plan mode). isTTY-null cegah hang saat run manual.
function bacaKonteksHook() {
  try {
    if (process.stdin.isTTY) return null
    let mentah = fs.readFileSync(0, 'utf8')
    if (!mentah) return null
    // Buang BOM: sebagian pipa/shell Windows menyisipkan U+FEFF -> JSON.parse melempar. Inline
    // SENGAJA (bukan import engine/fs-text.mjs stripBom): hook harus tetap jalan walau .lintasai
    // parsial/korup; import gagal meruntuhkan SELURUH hook termasuk 2 blok lama (LP-004).
    if (mentah.charCodeAt(0) === 0xFEFF) mentah = mentah.slice(1)
    if (!mentah.trim()) return null
    return JSON.parse(mentah)
  } catch {
    return null
  }
}

// buildReminder DICABUT 2026-07-26: perakit teks pengingat yang NOL pemanggil di seluruh repo (kode,
// tes, tools - semuanya). Dulu dipakai adaptor Kimi engine/kimi/lang-reminder-kimi.mjs; adaptor itu
// DICABUT di ADR-032 karena Kimi membaca AGENTS.md secara native, tapi fungsinya tertinggal + komentarnya
// masih menunjuk folder yang sudah tak ada. Jalur cetak Claude tak pernah memakainya: cetakEkor di bawah
// merakit teksnya sendiri dari pengingatBahasa/pengingatRisiko/pengingatPlanMode.

// Blok-5 "Petunjuk Rak": menyodorkan PATH rak yang relevan dengan isi prompt. Menutup celah terukur -
// uji 2026-07-19: pada tugas RINGAN, rak relevan dibuka 0% bukan karena AI menolak, tapi karena ia tak
// pernah berhenti untuk bertanya "rak mana yang relevan?". Ini pengingat LUNAK: tak memblokir apa pun.
//
// 🔑 IMPOR DINAMIS DI DALAM try (LP-004): tabel pemicu hidup di berkas TERPISAH. `import` statis akan
// meruntuhkan SELURUH hook (termasuk 2 blok lama) kalau .lintasai parsial/korup - itu pelajaran mahal
// yang sudah tercatat. Dengan import dinamis ber-try, kerugian terburuk = blok-5 absen, sisanya utuh.
// FAIL-SILENT disengaja: pengingat yang gagal TIDAK boleh menghasilkan pesan error ke staff.
export async function muatPetunjukRak(prompt, root) {
  try {
    if (!prompt || typeof prompt !== 'string') return ''
    const [{ bangunPetunjukRak }, { muatRegistry }, fs, path] = await Promise.all([
      import('./rak-pemicu.mjs'), import('./skill-registry.mjs'), import('node:fs'), import('node:path'),
    ])
    const basis = [root, process.cwd()].filter((b) => b && typeof b === 'string')
    // Kandidat `kit/` = repo-dev setelah pemisahan client/dev; DITARUH TERAKHIR supaya `.lintasai/`
    // (salinan kit asli di project client) selalu menang lebih dulu.
    const ada = (rel) => basis.some((b) => {
      try {
        return fs.existsSync(path.join(b, rel))
          || fs.existsSync(path.join(b, NAMA_FOLDER_KIT, rel))
          || fs.existsSync(path.join(b, 'kit', rel))
      } catch { return false }
    })
    // SHIM transisi (ADR-027): registry skill (kalau ada) DULU; kosong -> bangunPetunjukRak fallback tabel lama.
    return bangunPetunjukRak(prompt, ada, muatRegistry(basis))
  } catch {
    return '' // tabel/registry hilang/korup -> pengingat lama tetap utuh, blok-5 sekadar absen
  }
}

// Keputusan blok-2 (MURNI - cuma baca teks Petunjuk Rak, tak menyentuh disk/registry lagi). Sengaja
// diturunkan dari keluaran yang SUDAH dihitung: nol parse registry kedua (registry ~20 KB).
//   '' / kosong            -> topik TAK dikenali            -> CETAK (tak tahu = jangan lengah)
//   memuat 🔒              -> ada rak rawan keamanan        -> CETAK
//   'Belum ada rak spesifik'-> penangkap-umum, topik kabur   -> CETAK
//   selebihnya             -> topik dikenali & semua aman   -> LEWATI (satu-satunya jalur hemat)
export function putuskanBlokRisiko(petunjuk) {
  if (typeof petunjuk !== 'string' || !petunjuk.trim()) return true
  if (petunjuk.includes('🔒')) return true
  if (petunjuk.includes('Belum ada rak spesifik')) return true
  return false
}

// Jangkar berkala: walau topiknya aman, blok-2 tetap muncul tiap giliran ke-10 dalam SATU sesi supaya
// pada sesi panjang pengingat tak lenyap sama sekali. Tanpa session_id -> TIDAK menghitung: bucket
// bersama 'nosession' akan mencampur sesi (dan bikin tes non-deterministik). Impor DINAMIS ber-try
// (LP-004): util state hilang/korup -> false, pengingat lain tetap utuh.
export async function jangkarBerkala(sessionId, setiap = 10) {
  if (!sessionId) return false
  try {
    const { readState, writeState } = await import('./hook-session-state.mjs')
    const s = readState('langreminder', sessionId, {})
    const giliran = (Number(s.giliran) || 0) + 1
    writeState('langreminder', sessionId, { ...s, giliran })
    return giliran % setiap === 0
  } catch {
    return false
  }
}

// Jalankan sebagai hook HANYA saat di-run langsung (harness Claude Code menjalankannya). Saat di-IMPORT
// (adaptor Kimi) -> JANGAN auto-cetak / auto-baca-stdin. Perilaku saat di-run langsung SAMA PERSIS.
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  // Blok BAHASA dicetak DULU + SINKRON, sebelum menyentuh stdin (fail-safe berlapis yang DISENGAJA):
  // apa pun yang gagal sesudah baris ini, pengingat TERPENTING sudah ter-flush.
  console.log(pengingatBahasa.join('\n'))
  const konteksHook = bacaKonteksHook()
  // process.exitCode (bukan process.exit) = aman dari stdout ke-potong. 0 = jangan blokir pesan user.
  process.exitCode = 0

  // Ekor pengingat dicetak di SATU tempat supaya urutannya tetap: risiko -> plan-mode -> rak
  // (urutan lama; dikunci tests/lang-reminder.test.mjs "urutan plan-mode dulu").
  const cetakEkor = (risiko, rak) => {
    if (risiko) console.log('\n' + pengingatRisiko.join('\n'))
    if (konteksHook && konteksHook.permission_mode === 'plan') console.log('\n' + pengingatPlanMode.join('\n'))
    if (rak) console.log('\n' + rak)
  }

  const prompt = konteksHook && typeof konteksHook.prompt === 'string' ? konteksHook.prompt : null
  const sesi = konteksHook && typeof konteksHook.session_id === 'string' ? konteksHook.session_id : ''
  if (prompt === null) {
    cetakEkor(true, '') // tak ada prompt terbaca -> tak tahu -> CETAK (fail-safe)
  } else {
    // Blok-5 + keputusan blok-2 ber-try: blok bahasa sudah ter-flush di atas, jadi apa pun yang gagal
    // di sini (tabel hilang, disk aneh) jatuh ke jalur aman "cetak" - bukan meruntuhkan pengingat (LP-004).
    muatPetunjukRak(prompt, konteksHook.cwd)
      .then(async (rak) => cetakEkor(putuskanBlokRisiko(rak) || await jangkarBerkala(sesi), rak))
      .catch(() => cetakEkor(true, '')) // fail-silent ke user, fail-safe ke isi pengingat
  }
}
