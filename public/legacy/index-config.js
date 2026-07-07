window.PLAYLY_SUPABASE = {
      url: "https://urfkqcdwcvyzctbtbpwv.supabase.co",
      key: "sb_publishable_DJBulGFQevEx4Sk0B3WCaQ_eLu9noic",
    };
    // v547 (2026-05-25): Cloudflare R2 video storage. Egress $0 vs Supabase
    // Storage (5 GB/mo cap, $0.09/GB after). New uploads → R2; existing videos
    // tetap stream dari Supabase URL yg tersimpan di v.videoUrl.
    //
    // ROLLOUT SEQUENCE (status: setup pending):
    //   1. User setup Cloudflare R2: signup, bikin bucket, generate API token
    //   2. Set env vars di Vercel dashboard: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
    //      R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL
    //   3. Update PLAYLY_R2_PUBLIC_URL di bawah ke bucket public URL
    //      (e.g. "https://pub-xxx.r2.dev" atau "https://cdn.playly.id")
    //   4. Flip PLAYLY_USE_R2 ke true → bump cache-bust → deploy
    //
    // Sebelum rollout selesai: leave PLAYLY_USE_R2 = false. Cloud-sync skip
    // R2 path → langsung pakai Supabase Storage (zero regression vs v546).
    window.PLAYLY_USE_R2 = true; // v547 ACTIVATED — R2 setup complete 2026-05-25
    window.PLAYLY_R2_PUBLIC_URL = "https://pub-c0bf4a455f2c43618a7d4754ae9f7835.r2.dev";