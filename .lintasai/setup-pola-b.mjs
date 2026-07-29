#!/usr/bin/env node
// setup-pola-b.mjs - Pemasang kit lintasAI di project (Pola B), versi Node.
//
// uji-jalan berkali-kali. JANGAN daftarkan ke COMMANDS_NODE sebelum gerbang end-to-end lulus.
//
// TAHAP 1: TULANG PUNGGUNG = bagian yang berjalan SAMA dengan/tanpa manusia (deterministik): salin
//   berkas kit + dokumen + tulis kartu identitas + simpan catatan-pasang (.install-manifest.json,
//   ber-stempel keaslian) + gabung daftar izin + daftar tim.
// TAHAP 2 (kini AKTIF, NON-INTERAKTIF): nama/repo, pilihan AGENTS.md, rapikan folder bersarang,
//   identitas git, buka VS Code, rangkuman penutup + panduan kunci-gabung. KEPUTUSAN OWNER 06-22:
//   popup jendela GUI DIBUANG dari versi Node - pemasang kini SEPENUHNYA OTOMATIS: tiap "pertanyaan"
//   langsung dijawab NILAI-AMAN (tak menampilkan apa pun, tak hang, tak crash),
//   dan pilihan sebenarnya dilakukan staff lewat AI di chat sesudah pemasangan. Logika murni yang bisa
//   diuji (validasi email, urutan opsi, deteksi VS Code, panduan commit) ada di engine/setup-interactive.mjs.
//
// Bahasa output WAJIB non-programmer Indonesia (ADR-004 #3).
// PETA ISI (Fase E 2026-07-25: berkas ini kini ORKESTRATOR + fasad; isinya pindah ke 6 modul):
//   engine/setup-steps.mjs      tahap 1-9  : siapkan + amankan kit (badan main() yang lama)
//   engine/setup-deploy.mjs     tahap 10-14: tulis berkas ke project client
//   engine/setup-stage2.mjs     TAHAP 2: identitas git + buka VS Code
//   engine/setup-summary.mjs    rangkuman akhir + 2 papan status (bukti, bukan klaim)
//   engine/setup-prompts.mjs    shim "tanya user" yang selalu membalas nilai-aman
//   engine/setup-kit-filter.mjs shouldCopyKitEntry + penjaga repo-pengembangan
//   engine/setup-fs.mjs         appendGitignoreIfMissing + deployOne + writeMarkerSafe
// Berkas ini menahan yang memang miliknya: penguraian argumen + URUTAN tahap (urutannya bermakna,
// lihat komentar di main()) + wiring hook & TAHAP 2 + penutup.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { installSecretHook } from './engine/install-secret-hook.mjs'
import { installProjectHooks } from './engine/setup-hooks.mjs'
import { adalahRepoPengembanganKit, shouldCopyKitEntry } from './engine/setup-kit-filter.mjs'
import { setupGitIdentity, launchVsCode } from './engine/setup-stage2.mjs'
import { printFinalSummary } from './engine/setup-summary.mjs'
import {
  laporModeInteraktif, tentukanAkarProject, praCekStack, salinKitKeProject, rapikanKitBersarang,
  siapkanIdentitasPemasangan, amankanKitDanRingkasAwal, verifikasiBerkasIntiKit, catatBerkasKitKeManifest,
} from './engine/setup-steps.mjs'
import {
  susunPlaceholders, migrasiDanGerbangAgents, pasangKernelDanPemuat, pasangDocsDanBerkasTim,
  tulisKartuDanCatatanPasang,
} from './engine/setup-deploy.mjs'

// FASAD: empat nama ini dulu didefinisikan di berkas ini dan diimpor dari sini oleh update-kit.mjs +
// 4 berkas tes (setup-copy-filter, paritas-distribusi, setup-guard-repo-kit, setup-pola-b-write).
// Tetap di-export ulang supaya nol titik impor berubah.
export { adalahRepoPengembanganKit, shouldCopyKitEntry }
export { buildGuardStatusLines, buildHarnessLandingLines } from './engine/setup-summary.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ---- Baca pilihan baris-perintah ----
function parseArgs(argv) {
  const a = { force: false, dryRun: false, skipTeamFiles: false, noGui: false, projectRoot: null, projectRootMode: null }
  for (let i = 0; i < argv.length; i++) {
    const t = String(argv[i]).toLowerCase()
    if (t === '--force') a.force = true
    else if (t === '--dry-run' || t === '--dryrun' || t === '--simulasi') a.dryRun = true
    else if (t === '--skip-team-files' || t === '--skipteamfiles') a.skipTeamFiles = true
    else if (t === '--no-gui' || t === '--nogui') a.noGui = true
    else if (t === '--project-root' || t === '--projectroot') a.projectRoot = argv[++i] || null
    // Celah 4 (ADR-024): jawaban atas "pasang di akar project, atau di folder sekarang?".
    // Sengaja bendera, bukan popup - pemasang Node berjalan OTOMATIS PENUH tanpa input konsol.
    else if (t.startsWith('--project-root-mode=')) a.projectRootMode = t.slice('--project-root-mode='.length)
    else if (t === '--project-root-mode') a.projectRootMode = String(argv[++i] || '').toLowerCase()
  }
  return a
}

function main() {
  // Konteks pemasangan: SATU objek yang dioper ke tiap tahap. KitDir & projectRoot sengaja mutable —
  // keduanya berubah di tengah jalan (lihat engine/setup-steps.mjs), dan tahap berikutnya WAJIB
  // melihat nilai terbaru, bukan salinan lama.
  const args = parseArgs(process.argv.slice(2))
  const ctx = { args, KitDir: __dirname, projectRoot: null, npxMode: false, skippedSteps: [] }

  // Urutan di bawah = urutan yang terlihat di layar staff. Jangan ditukar tanpa alasan: pra-cek stack
  // sengaja SEBELUM penyalinan (jangan tinggalkan .lintasai setengah-jadi di project non-Node), dan
  // henti-keras repo-dev sengaja SEBELUM .git dibersihkan.
  laporModeInteraktif(ctx)
  tentukanAkarProject(ctx)
  praCekStack(ctx)
  salinKitKeProject(ctx)
  rapikanKitBersarang(ctx)
  siapkanIdentitasPemasangan(ctx)
  amankanKitDanRingkasAwal(ctx)
  verifikasiBerkasIntiKit(ctx)
  catatBerkasKitKeManifest(ctx)
  susunPlaceholders(ctx)
  migrasiDanGerbangAgents(ctx)
  pasangKernelDanPemuat(ctx)
  pasangDocsDanBerkasTim(ctx)
  tulisKartuDanCatatanPasang(ctx)

  const { KitDir, projectRoot, projectName, kitVersion, manifestState, skippedSteps, almostEmpty } = ctx
  const { dryRun, skipTeamFiles } = args

  // ---- Pasang hook + wiring project (daftar izin, hook bahasa/risk-gate/rekam-pelajaran, Kimi, penjaga rahasia) ----
  // Diekstrak ke engine/setup-hooks.mjs (refactor hemat-token, fungsi tak berubah - string output + urutan IDENTIK,
  // dikunci tests/setup-pola-b-write.test.mjs). Semua langkah deterministik + FAIL-SAFE. secretHookDeferred=true
  // kalau penjaga rahasia dilewati (project belum "git init") -> dipasang ulang di bawah setelah setupGitIdentity
  // mungkin membuat git init (tutup celah-bocor .env di antara git-init dan update berikutnya).
  const { secretHookDeferred } = installProjectHooks({ projectRoot, kitDir: KitDir, dryRun, manifestState })

  // ---- TAHAP 2: identitas git + buka VS Code ----
  // Lewati semua di mode SIMULASI (tanpa efek samping). setupGitIdentity bisa MENGHENTIKAN proses
  // (process.exit) kalau user pilih "batalkan setup di langkah git".
  if (!dryRun) {
    setupGitIdentity({ projectRoot, kitDir: KitDir, skippedSteps })
    // #1 tutup celah-bocor: kalau penjaga rahasia tadi DILEWATI karena belum git init, DAN setupGitIdentity
    // baru saja membuat git init di sesi ini, pasang penjaga SEKARANG (jangan tunggu update berikutnya).
    // installSecretHook idempoten + fail-open: kalau git tetap tak ada (user lewati init) -> no-op aman.
    // Catatan: tak addToManifest di sini (saveManifest di tulisKartuDanCatatanPasang sudah jalan -> entri
    // tak akan ter-persist, sama seperti pencatatan hook awal; yang penting hook fisik terpasang).
    if (secretHookDeferred) {
      try {
        const sh2 = installSecretHook(projectRoot)
        if (sh2.installed) {
          console.log('OK    Penjaga rahasia pre-commit terpasang setelah git init - file .env/kunci ditolak sebelum commit. Lewati darurat: git commit --no-verify.')
        }
      } catch (e) {
        console.log(`PERINGATAN: Pasang penjaga rahasia (setelah git init) dilewati: ${e.message} (pemasangan TETAP berhasil).`)
      }
    }
    launchVsCode({ projectRoot, kitDir: KitDir, skippedSteps })
  }

  // ---- Rangkuman akhir (terstruktur + bisa langsung ditindaklanjuti) ----
  printFinalSummary({ projectName, projectRoot, kitVersion, almostEmpty, skipTeamFiles, dryRun, skippedSteps })
  process.exit(0)
}

// Jalankan HANYA kalau dipanggil langsung (node setup-pola-b.mjs ...), bukan saat di-import untuk
// diuji. Cermin pola isMain modul engine lain (cegah eksekusi tak sengaja + buka jalan uji).
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) main()
