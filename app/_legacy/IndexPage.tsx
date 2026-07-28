// Legacy index app, rendered as a Next.js Server Component.
//
// The body markup is reproduced verbatim (dangerouslySetInnerHTML) so it is
// byte-identical to the old index.html — styles.css + script.js target these
// exact ids/classes. Scripts hidup di app/(site)/layout.tsx (<head>) sejak
// 26 Jul 2026 — dipindah ke sana utk memperbaiki hydration mismatch React 19
// (React me-hoist <script src> secara konsisten di server & client bila script
// memang di head; urutan eksekusi tetap seperti dokumen asli).
import { INDEX_MARKUP } from './index-markup';
import { INDEX_PREPAINT } from './index-prepaint';

export default function IndexPage() {
  // 26 Jul 2026: 8 legacy scripts DIPINDAH ke app/(site)/layout.tsx (<head>) —
  // perbaikan hydration mismatch React 19 (lihat catatan di layout.tsx). Hash
  // ?v= script kini dihitung di sana; V_* di file ini tak lagi dipakai render.
  return (
    <>
      {/* Pre-paint admin role detection — must run before the markup paints
          (sets body[data-role] for the FOUC guard). Verbatim from index.html. */}
      <script dangerouslySetInnerHTML={{ __html: INDEX_PREPAINT }} />

      {/* Full legacy body markup, byte-identical. */}
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: INDEX_MARKUP }} />
    </>
  );
}
