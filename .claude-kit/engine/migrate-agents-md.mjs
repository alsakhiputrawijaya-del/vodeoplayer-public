#!/usr/bin/env node
// engine/migrate-agents-md.mjs - Migrasi client LAMA ke tata-letak ADR-032 (cegah kehilangan data).
//
// MASALAH: sebelum ADR-032, `AGENTS.md` akar = milik CLIENT (override project: stack, opt-in mode) +
// kadang blok Codex generated (penanda LINTASAI-CODEX). Sejak ADR-032, `AGENTS.md` = KERNEL milik kit
// yang DI-REFRESH tiap update. Kalau update langsung menimpa AGENTS.md lama dengan kernel, kustomisasi
// client HILANG. Robot ini memindahkan bagian override client -> `AGENTS.override.md` LEBIH DULU.
//
// SIFAT: IDEMPOTEN + FAIL-SAFE. Tak melakukan apa-apa kalau (a) AGENTS.md sudah kernel baru, atau
// (b) AGENTS.override.md sudah ada (sudah pernah dimigrasi / client sudah pakai tata-letak baru).
// Tak pernah menghapus AGENTS.md di sini (penulisan kernel = tugas pemanggil, yang mencadangkan dulu).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Penanda kernel BARU (ADR-032). Kalau AGENTS.md memuat ini = sudah tata-letak baru, tak perlu migrasi.
export const KERNEL_MARKER = 'Aturan Kerja lintasAI (Microkernel)'
// Penanda blok Codex generated LAMA (dulu ditempel di bawah override client). Dibuang saat migrasi.
export const CODEX_BLOCK_MARKER = '<!-- LINTASAI-CODEX v1'

// Deteksi AGENTS.md gaya-lama + pindahkan bagian override client ke AGENTS.override.md.
// Return { migrated:boolean, reason, overridePath?, hadCodexBlock? }.
export function migrateOldAgentsMd({ projectRoot } = {}) {
  const agentsPath = path.join(projectRoot, 'AGENTS.md')
  const overridePath = path.join(projectRoot, 'AGENTS.override.md')

  if (!fs.existsSync(agentsPath)) return { migrated: false, reason: 'tak-ada-agents-md' }

  let content = ''
  try { content = fs.readFileSync(agentsPath, 'utf8') } catch { return { migrated: false, reason: 'tak-terbaca' } }

  // Sudah kernel baru -> bukan client lama, tak perlu migrasi.
  if (content.includes(KERNEL_MARKER)) return { migrated: false, reason: 'sudah-kernel-baru' }

  // AGENTS.override.md sudah ada -> sudah dimigrasi / client sudah tata-letak baru. Jangan timpa kerjanya.
  if (fs.existsSync(overridePath)) return { migrated: false, reason: 'override-sudah-ada' }

  // AGENTS.md gaya-lama = override client (+ mungkin blok Codex generated di bawah). Ambil bagian
  // override saja (buang blok Codex yang memang artefak generated, bukan kerja client).
  const idx = content.indexOf(CODEX_BLOCK_MARKER)
  const overridePart = (idx >= 0 ? content.slice(0, idx) : content).replace(/\s+$/, '') + '\n'

  try {
    fs.writeFileSync(overridePath, overridePart, 'utf8')
  } catch (e) {
    return { migrated: false, reason: `gagal-tulis-override: ${e.message}` }
  }
  return { migrated: true, reason: 'override-dipindah', overridePath, hadCodexBlock: idx >= 0 }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const argIdx = process.argv.indexOf('--project-root')
  const projectRoot = argIdx >= 0 ? process.argv[argIdx + 1] : process.cwd()
  const r = migrateOldAgentsMd({ projectRoot })
  console.log(r.migrated
    ? `Migrasi ADR-032: override lama dipindah ke AGENTS.override.md${r.hadCodexBlock ? ' (blok Codex generated dibuang)' : ''}.`
    : `Migrasi ADR-032: dilewati (${r.reason}).`)
}
