// engine/setup-fs.mjs — tiga operasi berkas kecil milik pemasang: tambah pola .gitignore,
// salin-1-template + catat ke manifest, dan tulis berkas penanda.
//
// Dipecah dari setup-pola-b.mjs (Fase E 2026-07-25): isi dipindah APA ADANYA — tiap teks konsol
// (LEWATI/OK/PERINGATAN/[SIMULASI]) byte-identik, karena urutan + isi keluaran pemasang dikunci
// tests/setup-pola-b-write.test.mjs.
//
// Ketiganya BEST-EFFORT by design: kegagalan di sini melapor lalu lanjut, tak pernah menggagalkan
// pemasangan (berkas kit yang sudah mendarat tetap sah).
import fs from 'node:fs'
import path from 'node:path'
import { addToManifest } from './manifest.mjs'
import { copyTemplateWithPlaceholder, copyStaticTemplate } from './template-deploy.mjs'
import { NAMA_FOLDER_KIT } from './project-root.mjs'

// === Pola .gitignore lintasAI — SATU SUMBER untuk pemasang DAN migrasi nama folder ==============
// KENAPA dipusatkan (2026-07-26): daftar ini dulu inline di setup-deploy.mjs saja. Waktu folder kit
// berganti nama, entri untuk nama BARU hanya menyusul kalau langkah setup benar-benar berjalan —
// dan `update` BERHENTI LEBIH AWAL saat versi sudah terbaru, jadi langkah itu bisa TIDAK jalan.
// Akibatnya `.manifest-secret` / `.install-manifest.json` folder baru TIDAK terlindungi dari commit.
// Migrasi kini memasang polanya sendiri lewat fungsi ini, memakai daftar yang SAMA (anti-drift).
export const HEADER_GITIGNORE_LINTASAI =
  '\n\n# === pola lintasAI (ditambah otomatis pemasang) ===\n# Cegah kebocoran: rahasia kit, identitas per-staff, folder cadangan.\n'

export function polaGitignoreLintasAI() {
  return [
    `${NAMA_FOLDER_KIT}/.audit-log`,
    `${NAMA_FOLDER_KIT}/.manifest-secret`,
    `${NAMA_FOLDER_KIT}/.install-manifest.json`,
    '.git-identity-*',
    '.staff-profile.md',
    `${NAMA_FOLDER_KIT}.backup-*/`,
    '*.backup-*',
    '*.bak',
    '*.bak.*',
  ]
}

// Pasang pola lintasAI ke .gitignore akar project. APPEND-only (entri lama client tak disentuh).
export function pasangPolaGitignoreLintasAI(projectRoot, dryRun = false) {
  return appendGitignoreIfMissing(
    path.join(projectRoot, '.gitignore'),
    polaGitignoreLintasAI(),
    HEADER_GITIGNORE_LINTASAI,
    dryRun,
  )
}

// Tambah pola ke .gitignore KALAU belum ada (pertahankan isi lama). UTF-8 no-BOM.
export function appendGitignoreIfMissing(gitignorePath, entries, headerComment, dryRun) {
  let existingLines = []
  if (fs.existsSync(gitignorePath)) {
    let raw = fs.readFileSync(gitignorePath, 'utf8')
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1) // buang BOM
    existingLines = raw.split(/\r?\n/)
  }
  const missing = entries.filter((e) => !existingLines.includes(e))
  if (missing.length === 0) return { added: 0 }
  if (dryRun) return { added: missing.length }
  const block = headerComment + missing.join('\n') + '\n'
  if (existingLines.length > 0 && fs.existsSync(gitignorePath)) {
    fs.appendFileSync(gitignorePath, block, 'utf8')
  } else {
    fs.writeFileSync(gitignorePath, block.replace(/^\n+/, ''), 'utf8')
  }
  return { added: missing.length }
}

// Salin 1 berkas template -> target + catat ke manifest. Lewati kalau target sudah ada.
export function deployOne({ src, dst, from, kind, placeholders = {}, manifestState, dryRun, withPlaceholder }) {
  if (fs.existsSync(dst)) {
    console.log(`LEWATI ${dst} (sudah ada, tidak ditimpa)`)
    return
  }
  if (!fs.existsSync(src)) {
    console.log(`PERINGATAN: Template tidak ditemukan: ${src} (lewati)`)
    return
  }
  if (dryRun) {
    console.log(`[SIMULASI] SALIN ${src} -> ${dst}`)
    return
  }
  const r = withPlaceholder
    ? copyTemplateWithPlaceholder({ sourcePath: src, targetPath: dst, placeholders, ifExists: 'Skip' })
    : copyStaticTemplate({ sourcePath: src, targetPath: dst, ifExists: 'Skip' })
  if (r.copied) {
    addToManifest(manifestState, dst, kind, from.replace(/\\/g, '/'))
    console.log(`OK    ${dst}`)
  } else if (r.action === 'missing') {
    console.log(`GAGAL salin ${dst}: sumber hilang`)
  }
}

// Tulis berkas penanda kecil (best-effort: gagal-pun tak menghentikan pemasangan). UTF-8 no-BOM.
export function writeMarkerSafe(markerPath, content = '') {
  try {
    fs.mkdirSync(path.dirname(markerPath), { recursive: true })
    fs.writeFileSync(markerPath, content, 'utf8')
  } catch (e) {
    console.log(`PERINGATAN: Gagal tulis penanda ${path.basename(markerPath)}: ${e.message}`)
  }
}
