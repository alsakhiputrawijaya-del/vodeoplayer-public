// Root layout for the main app (landing + user/admin dashboard).
//
// This is one of several "root layouts" (multiple-root-layout setup — there is
// no app/layout.tsx). It reproduces the <head> + <body> that the legacy
// index.html declared, so styles.css + script.js keep matching exactly. The
// page body markup itself lives in app/_legacy/IndexPage.tsx (rendered verbatim
// from the extracted legacy markup) — no .html file involved.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import type { Metadata, Viewport } from 'next';
import { legacyAsset } from '@/app/_legacy/legacy-asset';

// Hash isi file utk cache-bust ?v= legacy scripts (pola sama dgn cssVersion +
// assetVersion di IndexPage — duplikasi kecil disengaja supaya legacy-asset.ts
// tetap bebas fs (diimpor juga komponen lain).
function assetVersion(file: string, fallback: string): string {
  try {
    const served = process.env.NODE_ENV === 'production'
      ? file.replace(/\.(js|css)$/, '.min.$1')
      : file;
    return createHash('md5')
      .update(readFileSync(path.join(process.cwd(), 'public', 'legacy', served)))
      .digest('hex').slice(0, 12);
  } catch {
    return fallback;
  }
}

// Cache-bust ?v= untuk styles.css — OTOMATIS dari hash isi CSS yang disajikan,
// jadi BERUBAH sendiri tiap kali CSS berubah (di-compute sekali saat build).
// Sebelumnya di-set manual & sering lupa di-bump → browser nyangkut cache CSS
// lama (immutable 1thn) meski server sudah update. Fallback string statis kalau
// file tak terbaca (mis. dev sebelum minify).
function cssVersion(): string {
  try {
    const file = process.env.NODE_ENV === 'production'
      ? 'public/legacy/styles.min.css'
      : 'public/legacy/styles.css';
    return createHash('md5').update(readFileSync(path.join(process.cwd(), file))).digest('hex').slice(0, 12);
  } catch {
    return '20260628-fallback';
  }
}
const STYLES_V = cssVersion();

// FOUC guard (verbatim from index.html <head>): hide admin-only DOM on non-admin
// views before styles.css finishes loading, so admin UI never flashes.
const FOUC_CSS = `body:not([data-role="admin"]) .admin-only,
body:not([data-role="admin"]) [data-admin-only],
body:not([data-role="admin"]) #adminHeroCard,
body:not([data-role="admin"]) [data-view="admin-dashboard"],
body:not([data-role="admin"]) [data-view="admin-users"],
body:not([data-role="admin"]) [data-view="admin-videos"],
body:not([data-role="admin"]) [data-view="admin-reports"],
body:not([data-role="admin"]) [data-view="admin-payments"],
body:not([data-role="admin"]) [data-view="admin-broadcast"],
body:not([data-role="admin"]) [data-view="admin-settings"],
body:not([data-role="admin"]) [data-view="admin-player"] {
  display: none !important;
  visibility: hidden !important;
}`;

export const metadata: Metadata = {
  title: 'Playly. — Video Platform',
  description: 'Playly video platform',
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%231a0c10'/%3E%3Cpath d='M12 9v14l11-7z' fill='%23E7D7C4'/%3E%3C/svg%3E",
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1a0c10',
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // Dev: hitung ULANG hash CSS tiap render supaya edit styles.css langsung kebaca
  // tanpa restart server (STYLES_V const di-freeze saat modul load → edit CSS tak
  // meng-update ?v= → browser nyangkut cache lama). Prod: tetap pakai hash
  // build-time (STYLES_V const) supaya caching immutable jalan (nol cost runtime).
  const stylesV = process.env.NODE_ENV === 'production' ? STYLES_V : cssVersion();
  // 26 Jul 2026 (fix hydration error, temuan audit): 8 legacy scripts dipindah
  // dari IndexPage (page) ke layout — script klasik (tanpa async) TIDAK di-hoist
  // React 19 ("async prop must be true to allow scripts to be safely moved"),
  // jadi server & client merender di posisi yg sama → tanpa hydration mismatch.
  // Posisi AKHIR body (bukan head): script.js punya binding parse-time ke elemen
  // markup (mis. $("#signinForm") — harus sudah ter-parse saat script jalan.
  const vMain = assetVersion('script.js', '20260627-admin2-gates');
  const vCloud = assetVersion('cloud-sync.js', '20260627-orphan-leak-fix-v559');
  const vAuth = assetVersion('supabase-auth-bridge.js', '20260627-orphan-leak-fix-v559');
  const vPicons = assetVersion('picons.js', '20260516-settings-ico-v188');
  const vParticles = assetVersion('particles-bg.js', '20260516-particles-v2');
  const vVePlayback = assetVersion('video-edit-playback.js', '20260728-vepb1');
  // 30 Jul 2026 (fix "Legacy API keys are disabled" 401 badai): index-config.js
  // berisi kunci Supabase (PLAYLY_SUPABASE.key). Saat kunci dirotasi (anon lama →
  // sb_publishable), file di-update TAPI dulu dimuat TANPA ?v= → browser nyangkut
  // versi lama berkunci mati → cloud-sync 401 terus. Kini di-hash spt script lain
  // → berubah otomatis tiap isi (kunci) berubah, browser ambil yg baru.
  const vConfig = assetVersion('index-config.js', '20260730-supabase-key-rotation');
  return (
    <html lang="id" suppressHydrationWarning>
      <body data-theme="dark" className="auth-mode" suppressHydrationWarning>
        {/* React 19 hoists these <link>/<style> resources into <head>. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
          precedence="high"
        />
        <link rel="stylesheet" href={legacyAsset('styles.css', stylesV)} precedence="high" />
        <style href="playly-fouc-guard" precedence="high">
          {FOUC_CSS}
        </style>
        {children}
        {/* Legacy scripts — di AKHIR body (setelah markup) supaya kode parse-time
            di script.js yang mengakses DOM (mis. $("#signinForm") 26053) melihat
            elemen yang sudah ter-parse. Urutan WAJIB sama dgn index.html asli.
            Tanpa async (script klasik): React tidak me-hoist-nya ("async prop
            must be true to allow scripts to be safely moved" — react.dev), jadi
            server & client sama → tanpa hydration mismatch. */}
        <script src={legacyAsset('index-config.js', vConfig)} />
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" />
        {/* 28 Jul 2026: mesin penerap edit playback bersama (dipakai app + watch) —
            HARUS sebelum script.js (openPlayer/export preview memanggilnya). */}
        <script src={legacyAsset('video-edit-playback.js', vVePlayback)} />
        <script src={legacyAsset('cloud-sync.js', vCloud)} />
        <script src={legacyAsset('supabase-auth-bridge.js', vAuth)} />
        <script src={legacyAsset('script.js', vMain)} data-playly-main="1" />
        <script src={legacyAsset('picons.js', vPicons)} />
        <script src={legacyAsset('particles-bg.js', vParticles)} />
        <script src={legacyAsset('index-ensure.js')} />
      </body>
    </html>
  );
}
