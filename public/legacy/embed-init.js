(function () {
      "use strict";
      const SB_URL = "https://urfkqcdwcvyzctbtbpwv.supabase.co";
      const SB_KEY = "sb_publishable_DJBulGFQevEx4Sk0B3WCaQ_eLu9noic";
      const BUCKET = "videos";

      const $ = (id) => document.getElementById(id);
      function showError(title, msg) {
        $("loadingState").hidden = true;
        $("errorState").hidden = false;
        if (title) $("errTitle").textContent = title;
        if (msg) $("errMsg").textContent = msg;
      }

      // Vercel rewrite (`/id/:videoId/embed` → `/embed.html?v=:videoId`) hanya jalan
      // di server-side. URL bar di browser tetap path asli, jadi location.search bisa
      // kosong. Parse dari pathname dulu, fallback ke query untuk akses langsung
      // ke /embed.html?v=...
      function parseIdFromPath() {
        const parts = location.pathname.split("/").filter(Boolean);
        if (parts[0] !== "id") return { id: NaN, username: null };
        let username = null;
        let id = NaN;
        for (let i = 1; i < parts.length; i++) {
          const seg = parts[i];
          if (seg === "embed") continue;
          if (/^\d+$/.test(seg)) { id = parseInt(seg, 10); continue; }
          if (!username) username = seg;
        }
        return { id, username };
      }
      const params = new URLSearchParams(location.search);
      const fromPath = parseIdFromPath();
      const fromQuery = parseInt(params.get("v") || params.get("id") || "", 10);
      const videoId = Number.isFinite(fromPath.id) ? fromPath.id : fromQuery;
      // Watermark link → buka halaman watch publik
      if (videoId) {
        $("wmLink").href = `/id/${videoId}`;
      }

      if (!videoId) {
        showError("Link tidak valid", "Video ID tidak ditemukan.");
        return;
      }

      const sb = supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

      async function findVideoMeta(id) {
        // 28 Jul 2026: via endpoint publik (scan kv playly-state-* sudah kosong
        // sejak state pindah ke user_state owner-only — semua embed 404).
        try {
          const r = await fetch(`/api/public-video?id=${encodeURIComponent(id)}`, { credentials: "same-origin" });
          const d = await r.json().catch(() => null);
          if (r.ok && d && d.ok && d.id) return { meta: d, creator: d.creator || "creator" };
        } catch (e) {}
        return null;
      }

      async function resolveBlobUrl(id) {
        try {
          const { data: list } = await sb.storage.from(BUCKET).list("", { search: `${id}.` });
          const f = (list || []).find((x) => x.name && x.name.startsWith(`${id}.`));
          if (!f) return null;
          const SIGNED_TTL = 7200;
          const { data: signed, error } = await sb.storage
            .from(BUCKET).createSignedUrl(f.name, SIGNED_TTL);
          if (!error && signed?.signedUrl) return signed.signedUrl;
          const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(f.name);
          return pub?.publicUrl || null;
        } catch { return null; }
      }

      (async function load() {
        try {
          const found = await findVideoMeta(videoId);
          let url = null;
          if (found?.meta?.videoUrl && /^https?:/.test(found.meta.videoUrl)) {
            url = found.meta.videoUrl;
          } else {
            url = await resolveBlobUrl(videoId);
          }
          if (!url) {
            showError("Video belum tersedia", "File video belum di-upload atau sudah dihapus.");
            return;
          }
          if (found?.meta?.title) {
            document.title = `${found.meta.title} • Playly`;
          }
          const v = $("videoEl");
          v.src = url;
          v.hidden = false;
          $("loadingState").hidden = true;
          // Autoplay muted (browser policy) — kalau di-iframe, suara user-gesture only
          v.muted = true;
          v.play().catch(() => { /* user gesture required, OK */ });
        } catch {
          showError("Gagal memuat", "Coba refresh atau cek koneksi.");
        }
      })();
    })();
  