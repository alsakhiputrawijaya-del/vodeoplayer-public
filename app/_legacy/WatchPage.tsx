// Public watch page (was watch.html), as a Server Component. Markup verbatim;
// page CSS via watch.css; the standalone player logic via watch-init.js (moved
// verbatim from the old inline <script>). supabase-js loaded from CDN first, in
// the original order.
import { WATCH_MARKUP } from './watch-markup';
import { legacyAsset } from './legacy-asset';

export default function WatchPage() {
  return (
    <>
      <link rel="stylesheet" href={legacyAsset('watch.css')} precedence="high" />
      <link rel="preconnect" href="https://urfkqcdwcvyzctbtbpwv.supabase.co" crossOrigin="" />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: WATCH_MARKUP }} />
      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" />
      {/* 28 Jul 2026: mesin penerap edit playback (crop/filter/teks/audio/fade/
          trim/backsound) — dimuat sebelum watch-init supaya hasil edit video
          tampil juga ke penonton publik (sebelumnya hanya di app utama). */}
      <script src={legacyAsset('video-edit-playback.js')} />
      <script src={legacyAsset('watch-init.js')} />
    </>
  );
}
