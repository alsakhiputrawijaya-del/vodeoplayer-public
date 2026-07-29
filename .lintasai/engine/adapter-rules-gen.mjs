#!/usr/bin/env node
// engine/adapter-rules-gen.mjs - Generator berkas aturan untuk alat AI yang butuh format KHUSUS.
//
// SEJAK ADR-032: kernel = `AGENTS.md` akar project = acuan tunggal, dibaca NATIVE oleh Codex, Kimi Code,
// dan Cursor (standar terbuka agents.md) + oleh Claude lewat `CLAUDE.md` @import. Karena itu generator
// salinan Codex (buildCodexAgents) & Kimi (buildKimiAgents) DIPENSIUNKAN - mereka membaca AGENTS.md akar
// langsung, tak perlu fotokopi. Yang TERSISA cuma Cursor: Cursor memuat `.cursor/rules/*.mdc` dengan
// frontmatter `alwaysApply: true` (dokumentasi resmi cursor.com/docs/context/rules, diverifikasi
// 2026-07-20) - format itu tak bisa dipenuhi AGENTS.md polos, jadi 1 berkas .mdc tetap di-generate DARI
// AGENTS.md. Perintah CLI payung tetap `adapter-sync` (kompat), kini cuma menyinkron Cursor.
//
// SIFAT: DETERMINISTIK (isi = salinan literal kernel + header tetap) -> regenerate selalu identik.
// Artefak GENERATED (gitignored; dibuat saat install ke client; REGENERATE saat update).
// present:false = sumber (AGENTS.md) tak ketemu (auto-skip anggun).
//
// TERUJI: buildCursorRules PURE + runAllAdaptersSync (isi disuntik) - tests/adapter-rules-gen.test.mjs.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { stripBom, readTextSafe, writeUtf8NoBom, backupStamp } from './fs-text.mjs'
import { NAMA_FOLDER_KIT, cariFolderKit } from './project-root.mjs'

// Anjuran panjang berkas aturan Cursor (BUKAN batas keras - melewatinya tidak menggagalkan apa pun).
export const CURSOR_RULES_SOFT_MAX_LINES = 500

export const CURSOR_RULES_MARKER = '<!-- LINTASAI-CURSOR v1 - DIBUAT OTOMATIS oleh lintasAI - JANGAN edit tangan -->'

// PURE: bangun isi .cursor/rules/lintasai.mdc. Frontmatter `alwaysApply: true` = ikut TIAP sesi chat.
export function buildCursorRules({ rulesText, kitPrefix = `${NAMA_FOLDER_KIT}/` } = {}) {
  const rules = stripBom(String(rulesText == null ? '' : rulesText)).replace(/\s+$/, '')
  const header = [
    '---',
    'description: Aturan kerja tetap lintasAI - bahasa Indonesia non-programmer, anti-ngarang, baca-kode-sebelum-mengubah.',
    'globs:',
    'alwaysApply: true',
    '---',
    '',
    CURSOR_RULES_MARKER,
    '',
    '# Aturan Kerja lintasAI - untuk Cursor',
    '',
    '> Berkas ini DIBUAT OTOMATIS dari `AGENTS.md` (kernel akar project). Karena',
    '> `alwaysApply: true`, isinya ikut di SETIAP sesi chat Cursor. Isinya **IDENTIK** dengan aturan',
    '> yang dipakai di Claude/Codex/Kimi (tak ada yang dipangkas). JANGAN edit dengan tangan - akan ditimpa',
    '> saat update kit.',
    '>',
    '> BATAS JUJUR: Cursor TIDAK punya sistem hook, jadi palang mesin lintasAI (Palang Rem, Palang',
    '> Rak, Lampu Hijau plan mode) TIDAK berlaku di sini. Yang sampai = teks aturannya saja.',
    '>',
    '> **AI: baca `' + kitPrefix + 'PETA.md` PERTAMA** untuk tahu "apa di mana" (fungsi tiap folder +',
    '> daftar skill) + ke mana menaruh berkas baru. PETA DIRUJUK (bukan disalin) supaya tak basi.',
    '>',
    '> Rincian per-topik dibaca ON-DEMAND (pakai tool baca berkas saat tugas cocok pemicunya, jangan',
    '> dimuat sekaligus): daftar isi di `' + kitPrefix + 'skills/registry.json`.',
    '',
    'Baca berkas peta ini lebih dulu (Cursor menarik isinya sebagai konteks):',
    '',
    '@' + kitPrefix + 'PETA.md',
    '',
    '---',
    '',
    '',
  ].join('\n')
  return header + rules + '\n'
}

// Cari sumber aturan (kernel AGENTS.md). SEJAK ADR-032 kernel ada di ROOT project (dogfood & client).
// kitPrefix untuk pointer rak = '<folder-kit>/' kalau folder itu ada (client), '' kalau dogfood.
// Nama folder LAMA ikut dikenali: client yang belum migrasi tetap dapat prefix yang BENAR — kalau
// tidak, pointer rak di .cursor/rules menunjuk folder yang tak ada dan Cursor gagal diam-diam.
// Return {path, kitPrefix} atau null.
export function findRulesSource(repoRoot = process.cwd()) {
  const temuanKit = cariFolderKit(repoRoot)
  const kitPrefix = temuanKit ? `${temuanKit.nama}/` : ''
  const atRoot = path.join(repoRoot, 'AGENTS.md')
  const atClient = temuanKit ? path.join(temuanKit.path, 'AGENTS.md') : path.join(repoRoot, NAMA_FOLDER_KIT, 'AGENTS.md')
  // Kandidat KETIGA: repo-dev setelah pemisahan client/dev — kernel tinggal di `kit/AGENTS.md`.
  // Tanpa ini `adapter-sync` mati DIAM-DIAM ("sumber tak ketemu") dan berkas aturan Cursor jadi basi
  // tanpa satu pun tanda. Ditaruh terakhir supaya kernel client (.lintasai/) tetap menang lebih dulu.
  const atKitDev = path.join(repoRoot, 'kit', 'AGENTS.md')
  if (fs.existsSync(atRoot)) return { path: atRoot, kitPrefix }
  if (fs.existsSync(atClient)) return { path: atClient, kitPrefix }
  if (fs.existsSync(atKitDev)) return { path: atKitDev, kitPrefix }
  return null
}

// Orkestrasi Cursor: tulis .cursor/rules/lintasai.mdc dari kernel AGENTS.md.
export function runCursorRulesGen({ repoRoot = process.cwd(), write = false } = {}) {
  const src = findRulesSource(repoRoot)
  if (!src) return { present: false }

  const rulesText = readTextSafe(src.path)
  if (rulesText == null) return { present: false }

  const content = buildCursorRules({ rulesText, kitPrefix: src.kitPrefix })
  const bytes = Buffer.byteLength(content, 'utf8')
  const lines = content.split('\n').length
  const overSoftLimit = lines > CURSOR_RULES_SOFT_MAX_LINES
  const targetDir = path.join(repoRoot, '.cursor', 'rules')
  const target = path.join(targetDir, 'lintasai.mdc')
  const existing = readTextSafe(target)
  const exists = existing != null
  const inSync = exists && existing === content

  if (!write) return { present: true, target, exists, inSync, bytes, lines, overSoftLimit }
  if (inSync) return { present: true, target, action: 'current', bytes, lines, overSoftLimit }

  let backup = null
  if (exists && !existing.includes('LINTASAI-CURSOR v1')) {
    backup = `${target}.backup-${backupStamp(new Date())}`
    try { fs.copyFileSync(target, backup) } catch { backup = null }
  }
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
  writeUtf8NoBom(target, content)
  return { present: true, target, action: exists ? 'updated' : 'created', backup, bytes, lines, overSoftLimit }
}

// --- Orkestrasi payung: sinkron/cek adapter (kini hanya Cursor - Codex/Kimi baca AGENTS.md native). ---
// Dipakai perintah CLI `adapter-sync`. write:false = cek sinkron (cuma-baca); write:true = tulis.
// Return { cursor } = hasil runCursorRulesGen (present:false = sumber tak ketemu). TESTABLE.
export function runAllAdaptersSync({ repoRoot = process.cwd(), write = false } = {}) {
  return {
    cursor: runCursorRulesGen({ repoRoot, write }),
  }
}

// Pelapor CLI Cursor (bentuk hasil: present/exists/inSync/action/bytes/backup).
function laporCursor(label, res, write) {
  if (!res.present) { console.log(`${label}: DILEWATI - AGENTS.md tak ketemu.`); return }
  if (!write) {
    if (!res.exists) console.log(`${label}: BELUM ADA - jalankan \`npx lintasai adapter-sync --write\`.`)
    else if (res.inSync) console.log(`${label}: SINKRON (${res.bytes.toLocaleString('en-US')} byte).`)
    else console.log(`${label}: BASI - jalankan \`npx lintasai adapter-sync --write\`.`)
    return
  }
  const act = res.action === 'current' ? 'SUDAH sinkron' : res.action === 'created' ? 'DIBUAT' : 'DIPERBARUI'
  console.log(`${label}: ${act} (${res.bytes.toLocaleString('en-US')} byte).`)
  if (res.backup) console.log(`  Berkas lama dicadangkan ke: ${res.backup}`)
}

// --- CLI: `node engine/adapter-rules-gen.mjs [--project-root <dir>] [--write] [--check]` ---
// Dipicu `npx lintasai adapter-sync` - sinkron/cek berkas aturan Cursor (Codex/Kimi baca AGENTS.md native).
function main() {
  let repoRoot = process.cwd()
  let write = false
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--project-root') repoRoot = argv[++i] || repoRoot
    else if (argv[i] === '--write') write = true
    else if (argv[i] === '--check') write = false
  }

  const { cursor } = runAllAdaptersSync({ repoRoot, write })
  if (!cursor.present) {
    console.log(`adapter-sync: DILEWATI - AGENTS.md tak ketemu (root / ${NAMA_FOLDER_KIT}/).`)
    process.exit(0)
  }

  console.log(write
    ? 'adapter-sync (--write): sinkronkan aturan Cursor dari kernel AGENTS.md'
    : 'adapter-sync (cek sinkron, cuma-baca):')
  laporCursor('  Cursor (.cursor/rules/lintasai.mdc)', cursor, write)
  process.exit(0)
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) main()
