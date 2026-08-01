// =====================================================================
// VIDEO EDIT PLAYBACK — mesin penerap hasil edit saat PEMUTARAN (28 Jul 2026).
// Dipakai DUA halaman: app utama (script.js) & watch publik (watch-init.js).
// Sebelumnya fungsi ini hidup di script.js → hasil edit (crop/filter/teks/
// audio/fade/trim/speed/backsound) tak pernah tampil ke penonton watch.
// Non-destruktif: hanya CSS/properti pada elemen; file asli tidak diubah.
// =====================================================================

// Baca blob dari IndexedDB "playly-videos" (store "videos") — versi mandiri
// supaya halaman watch (yang tak memuat script.js) juga bisa resolve key
// backsound lokal. Pola sama dgn getVideoBlob di script.js.
function _veIdbGetBlob(id) {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open("playly-videos", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("videos");
      req.onerror = () => resolve(null);
      req.onsuccess = () => {
        try {
          const db = req.result;
          const tx = db.transaction("videos", "readonly");
          const g = tx.objectStore("videos").get(id);
          g.onsuccess = () => resolve(g.result || null);
          g.onerror = () => resolve(null);
        } catch { resolve(null); }
      };
    } catch { resolve(null); }
  });
}

function _veWavBlob(buffer) {
  // PCM16 stereo/mono WAV encoder (OfflineAudioContext → Blob audio/wav).
  const nCh = buffer.numberOfChannels, sr = buffer.sampleRate, n = buffer.length;
  const bytes = 44 + n * nCh * 2;
  const ab = new ArrayBuffer(bytes);
  const dv = new DataView(ab);
  const wstr = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  wstr(0, "RIFF"); dv.setUint32(4, bytes - 8, true); wstr(8, "WAVE");
  wstr(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
  dv.setUint16(22, nCh, true); dv.setUint32(24, sr, true);
  dv.setUint32(28, sr * nCh * 2, true); dv.setUint16(32, nCh * 2, true); dv.setUint16(34, 16, true);
  wstr(36, "data"); dv.setUint32(40, n * nCh * 2, true);
  const chans = [];
  for (let c = 0; c < nCh; c++) chans.push(buffer.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < nCh; c++) {
    const s = Math.max(-1, Math.min(1, chans[c][i]));
    dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true); o += 2;
  }
  return new Blob([ab], { type: "audio/wav" });
}

const _vePresetCache = {}; // id preset → objectURL WAV (render sekali per sesi)
async function _veRenderPreset(id) {
  if (_vePresetCache[id]) return _vePresetCache[id];
  if (typeof OfflineAudioContext === "undefined") return null;
  const SR = 44100;
  // Helper kecil utk bangun preset di OfflineAudioContext.
  const osc = (ctx, type, freq, t0, t1, gainNode) => {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    o.connect(gainNode); o.start(t0); o.stop(t1);
    return o;
  };
  const envGain = (ctx, t0, peak, attack, holdEnd) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, holdEnd);
    return g;
  };
  const noiseBuf = (ctx, dur) => {
    const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };
  const DEFS = {
    // Efek "ding": dua sinus harmonik, decay halus.
    ding: { dur: 1.4, build(ctx) {
      const out = ctx.createGain(); out.gain.value = 0.5; out.connect(ctx.destination);
      [880, 1319].forEach((f, i) => {
        const g = envGain(ctx, 0, i ? 0.35 : 0.6, 0.005, 1.35);
        g.connect(out); osc(ctx, "sine", f, 0, 1.4, g);
      });
    } },
    // Efek "whoosh": noise lewat bandpass yg frekuensinya naik.
    whoosh: { dur: 1.6, build(ctx) {
      const src = ctx.createBufferSource(); src.buffer = noiseBuf(ctx, 1.6);
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.1;
      bp.frequency.setValueAtTime(300, 0); bp.frequency.exponentialRampToValueAtTime(3600, 1.1);
      const g = envGain(ctx, 0, 0.55, 0.35, 1.55);
      src.connect(bp); bp.connect(g); g.connect(ctx.destination); src.start(0); src.stop(1.6);
    } },
    // Efek "pop": sinus turun cepat 280→55 Hz.
    pop: { dur: 0.35, build(ctx) {
      const g = envGain(ctx, 0, 0.7, 0.004, 0.33); g.connect(ctx.destination);
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(280, 0); o.frequency.exponentialRampToValueAtTime(55, 0.3);
      o.connect(g); o.start(0); o.stop(0.35);
    } },
    // Musik "Ambient Calm": pad segitiga Am–F–C–G @6s, lowpass lembut. Loop 24s.
    ambient: { dur: 24, build(ctx) {
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 950;
      const master = ctx.createGain(); master.gain.value = 0.4;
      lp.connect(master); master.connect(ctx.destination);
      const CH = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]];
      CH.forEach((chord, i) => {
        const t0 = i * 6;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.32, t0 + 1.8);
        g.gain.setValueAtTime(0.32, t0 + 4.4);
        g.gain.linearRampToValueAtTime(0.0001, t0 + 6);
        g.connect(lp);
        chord.forEach(f => osc(ctx, "triangle", f, t0, t0 + 6, g));
      });
    } },
    // Musik "Lo-fi Beat": kick tiap beat, hat offbeat, stab Rhodes Am7→Fmaj7.
    // 75 BPM (0.8s/beat) × 20 beat = 16s loop.
    lofi: { dur: 16, build(ctx) {
      const master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      for (let b = 0; b < 20; b++) {
        const t = b * 0.8;
        if (b % 2 === 0) { // kick
          const g = envGain(ctx, t, 0.8, 0.004, t + 0.16); g.connect(master);
          const o = ctx.createOscillator(); o.type = "sine";
          o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.14);
          o.connect(g); o.start(t); o.stop(t + 0.18);
        } else { // hat
          const src = ctx.createBufferSource(); src.buffer = noiseBuf(ctx, 0.05);
          const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 6000;
          const g = envGain(ctx, t, 0.18, 0.002, t + 0.045);
          src.connect(hp); hp.connect(g); g.connect(master); src.start(t); src.stop(t + 0.05);
        }
      }
      const STAB = [[220, 261.63, 329.63, 392], [174.61, 220, 261.63, 329.63]];
      for (let s = 0; s < 8; s++) {
        const t = s * 2 + 0.4;
        const g = envGain(ctx, t, 0.16, 0.01, t + 0.5); g.connect(master);
        STAB[s < 4 ? 0 : 1].forEach(f => osc(ctx, "triangle", f, t, t + 0.55, g));
      }
    } },
  };
  const def = DEFS[id];
  if (!def) return null;
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * def.dur), SR);
  def.build(ctx);
  const buf = await ctx.startRendering();
  const url = URL.createObjectURL(_veWavBlob(buf));
  _vePresetCache[id] = url;
  return url;
}

// Resolve sumber backsound → objectURL siap putar, atau null bila tak ada.
// audio = { url, preset, key } — url cloud (canonical) > preset sintetis > blob IDB.
async function _veBgmResolveUrl(audio) {
  if (!audio) return null;
  try {
    // URL cloud (hasil upload saat publish) — canonical, jalan utk semua penonton.
    if (audio.url && /^https?:/.test(audio.url)) return audio.url;
    if (audio.preset) return await _veRenderPreset(audio.preset);
    if (audio.key) {
      const blob = await _veIdbGetBlob(audio.key);
      return blob ? URL.createObjectURL(blob) : null;
    }
  } catch (e) { console.warn("[backsound] resolve gagal:", e); }
  return null;
}

// 1c (2026-06-04): Terapkan editan video (crop "Bebas"/zoom/posisi/rotate/flip/
// filter) ke elemen <video> saat PLAYBACK. Logika meniru applyEffects() editor
// supaya hasil di player == preview editor. Non-destruktif: hanya CSS pada
// elemen, file asli tidak diubah.
// 25 Jul 2026: crop "Bebas" TER-CENTER di box player (region dipotong clip-path
// lalu digeser+diskalakan ke tengah via suffix transform — meniru cropView).
// Bangun STRING CSS filter dari videoEdit (warna: brightness/contrast/saturasi/
// temperature/preset/hue). Dipisah jadi fungsi sendiri supaya SATU sumber
// kebenaran: dipakai playback (applyVideoEditCss) DAN bake ke file (transcodeVideo
// pakai ctx.filter — sintaks sama persis). Kembalikan "" kalau tak ada edit.
function veBuildEditFilter(edit) {
  if (!edit) return "";
  const bPct = (1 + (edit.brightness || 0) / 100) * 100;
  const cPct = (1 + (edit.contrast || 0) / 100) * 100;
  const sPct = (1 + (edit.saturation || 0) / 100) * 100;
  let f = `brightness(${bPct}%) contrast(${cPct}%) saturate(${sPct}%)`;
  const t = edit.temperature || 0;
  if (t > 0)      f += ` sepia(${Math.min(0.4, t / 75)}) saturate(${1 + t / 200})`;
  else if (t < 0) f += ` hue-rotate(${Math.max(-25, t)}deg) saturate(${1 - Math.abs(t) / 300})`;
  switch (edit.preset) {
    case "vintage":   f += " sepia(.4) contrast(1.05)"; break;
    case "bw":        f += " grayscale(1)"; break;
    case "cool":      f += " hue-rotate(-12deg) saturate(1.1)"; break;
    case "warm":      f += " sepia(.18) saturate(1.18)"; break;
    case "vivid":     f += " saturate(1.3) contrast(1.1)"; break;
    case "cinematic": f += " contrast(1.15) saturate(.85) brightness(.95) sepia(.08)"; break;
    case "dramatic":  f += " contrast(1.3) saturate(1.2) brightness(.92)"; break;
    case "faded":     f += " contrast(.85) saturate(.7) brightness(1.05)"; break;
    case "noir":      f += " grayscale(1) contrast(1.4) brightness(.9)"; break;
  }
  if (edit.hue) f += ` hue-rotate(${edit.hue}deg)`;
  return f;
}
if (typeof window !== "undefined") window.veBuildEditFilter = veBuildEditFilter;

function applyVideoEditCss(el, edit) {
  if (!el) return;
  // Simpan edit terakhir & hitung ulang otomatis: videoWidth/Height baru ada
  // setelah loadedmetadata (fungsi ini dipanggil tepat setelah src di-set), dan
  // rasio box player berubah saat fullscreen. Terikat sekali per elemen.
  el._veCssEdit = edit || null;
  if (!el.__veCssReapplyBound) {
    el.__veCssReapplyBound = true;
    const reapply = () => { try { applyVideoEditCss(el, el._veCssEdit); } catch (e) {} };
    el.addEventListener("loadedmetadata", reapply);
    document.addEventListener("fullscreenchange", reapply);
  }
  if (!edit) { el.style.transform = ""; el.style.filter = ""; el.style.clipPath = ""; try { el.playbackRate = 1; } catch (e) {} el._veTrimEnd = 0; _applyPlaybackTextOverlay(el, null); _applyPlaybackAudio(el, null); _applyPlaybackMusic(el, null).catch(() => {}); return; }
  const sx = edit.flipH ? -1 : 1;
  const sy = edit.flipV ? -1 : 1;
  const scale = Math.max(0, edit.zoom != null ? edit.zoom : 100) / 100;
  const tx = edit.posX || 0, ty = edit.posY || 0;
  // Freeform "Bebas" crop → clip-path region + suffix transform pemusat. Dihitung
  // sebelum transform dirangkai: cropTf ditaruh di AKHIR daftar transform supaya
  // berlaku paling awal di koordinat lokal; transform user menimpa di atasnya.
  let cropTf = "";
  if (edit.aspect === "bebas" && edit.crop) {
    const c = edit.crop;
    const vw = el.videoWidth, vh = el.videoHeight;
    const bw = el.clientWidth, bh = el.clientHeight;
    if (vw && vh && bw && bh) {
      // crop % tersimpan relatif FRAME video; clip/translate CSS relatif BOX
      // elemen. object-fit:contain → konten bisa letterbox di dalam box, jadi
      // petakan lewat rect konten (cw×ch, offset ox,oy) dalam fraksi box.
      const va = vw / vh, ba = bw / bh;
      let cw, ch;
      if (va > ba) { cw = 1; ch = ba / va; } else { ch = 1; cw = va / ba; }
      const ox = (1 - cw) / 2, oy = (1 - ch) / 2;
      const rx = ox + (c.x / 100) * cw, ry = oy + (c.y / 100) * ch;
      const rw = (c.w / 100) * cw,      rh = (c.h / 100) * ch;
      el.style.clipPath = `inset(${ry * 100}% ${(1 - rx - rw) * 100}% ${(1 - ry - rh) * 100}% ${rx * 100}%)`;
      // Scale "contain": region sebesar mungkin tanpa terpotong, lalu geser pusat
      // region ke pusat box (origin default 50% 50%): T = −s·(pusatRegion − 0.5).
      const cs = Math.min(1 / rw, 1 / rh);
      if (isFinite(cs) && cs > 0) {
        const ctx = -cs * (rx + rw / 2 - 0.5) * 100;
        const cty = -cs * (ry + rh / 2 - 0.5) * 100;
        cropTf = ` translate(${ctx}%, ${cty}%) scale(${cs})`;
      }
    } else {
      // Metadata/layout belum siap → fallback clip di posisi asal (perilaku lama);
      // listener loadedmetadata di atas mengoreksi begitu ukuran nyata tersedia.
      const top = c.y, left = c.x;
      const right = 100 - (c.x + c.w), bottom = 100 - (c.y + c.h);
      el.style.clipPath = `inset(${top}% ${right}% ${bottom}% ${left}%)`;
    }
  } else {
    el.style.clipPath = "";
  }
  el.style.transform = `translate(${tx}%, ${ty}%) rotate(${edit.rotate || 0}deg) scale(${scale}) scaleX(${sx}) scaleY(${sy})${cropTf}`;
  // Filter warna: satu sumber kebenaran veBuildEditFilter (dipakai jg saat bake).
  el.style.filter = veBuildEditFilter(edit);
  // 28 Jul 2026 (fix gap): TRIM & SPEED ditegakkan saat playback — tersimpan di
  // videoEdit oleh handler trim tapi dulu tak pernah diterapkan. Kini:
  // playbackRate = edit.speed, seek ke trimStart saat metadata siap, dan berhenti
  // (diperlakukan "ended") saat mencapai trimEnd. Guard terikat sekali per
  // elemen; nilai trim dibaca dinamis dari el._veTrimEnd supaya ganti video benar.
  if (edit.speed != null) { try { el.playbackRate = Number(edit.speed) || 1; } catch (e) {} }
  const _ts = Math.max(0, Number(edit.trimStart) || 0);
  const _te = Number(edit.trimEnd) || 0;
  el._veTrimEnd = (_te > _ts) ? _te : 0;
  if (_ts > 0 && el.duration && _ts < el.duration && Math.abs(el.currentTime - _ts) > 0.5) {
    try { el.currentTime = _ts; } catch (e) {}
  }
  if (!el.__veTrimGuardBound) {
    el.__veTrimGuardBound = true;
    el.addEventListener("timeupdate", function () {
      const ee = Number(el._veTrimEnd) || 0;
      if (ee > 0 && el.currentTime >= ee - 0.05 && !el.paused) {
        el.pause();
        el.dispatchEvent(new Event("ended")); // trim-end diperlakukan sbg akhir video
      }
    });
  }
  _applyPlaybackTextOverlay(el, edit);
  _applyPlaybackAudio(el, edit);
  _applyPlaybackMusic(el, edit).catch(() => {});
}

// 25 Jul 2026: render TEXT OVERLAY hasil edit saat playback & preview export.
// Overlay = div.ve-text-overlay.ve-playback-text sebagai SAUDARA elemen video di
// dalam parent (player wrap yg positioned + overflow:hidden). Pakai ulang CSS
// global .ve-text-overlay milik editor supaya tampilan persis sama; class
// .ve-playback-text pembeda agar query tak tertukar dgn overlay asli editor.
function _applyPlaybackTextOverlay(el, edit) {
  const parent = el && el.parentElement;
  if (!parent) return;
  let ov = parent.querySelector(":scope > .ve-playback-text");
  const t = ((edit && edit.text) || "").trim();
  if (!t) { if (ov) ov.remove(); return; }
  if (!ov) {
    ov = document.createElement("div");
    ov.className = "ve-text-overlay ve-playback-text";
    parent.appendChild(ov);
  }
  ov.textContent = t;
  ov.style.fontSize = (edit.textSize != null ? edit.textSize : 24) + "px";
  ov.style.color = edit.textColor || "#ffffff";
  ov.style.fontFamily = (edit.textFont || "Inter") + ", sans-serif";
  ov.dataset.pos = edit.textPos || "bottom";
  ov.style.display = "block";
}

// 25 Jul 2026: audio hasil edit (volume/muted/fade) — properti media, BUKAN CSS.
// Fade in/out = ramp volume saat diputar (listener timeupdate). Hanya disentuh
// bila edit punya field audio; reset HANYA bila sebelumnya kita yg menerapkan
// (flag _veAudioApplied) — supaya volume/mute manual user tak tertimpa ganti video.
function _applyPlaybackAudio(el, edit) {
  if (!el) return;
  // Lepas handler fade lama dulu; di-rebind di bawah bila masih perlu.
  if (el._veFadeHandler) { el.removeEventListener("timeupdate", el._veFadeHandler); el._veFadeHandler = null; }
  const hasAudio = !!(edit && (edit.volume != null || edit.muted != null || edit.fadeIn || edit.fadeOut));
  if (hasAudio) {
    const base = (edit.volume != null) ? Math.max(0, Math.min(1, edit.volume / 100)) : el.volume;
    if (edit.volume != null) el.volume = base;
    el.muted = !!edit.muted;
    el._veAudioApplied = true;
    const fi = Number(edit.fadeIn) || 0, fo = Number(edit.fadeOut) || 0;
    if (fi > 0 || fo > 0) {
      // 28 Jul: anchor fade ikut trim — fade-in dari trimStart, fade-out tuntas di
      // trimEnd (bukan durasi penuh) supaya ramp pas dgn rentang putar hasil trim.
      const fs = Math.max(0, Number(edit.trimStart) || 0);
      const fe = Number(edit.trimEnd) || 0;
      el._veFadeHandler = function () {
        const end = (fe > fs) ? fe : el.duration;
        if (!end) return;
        const t = el.currentTime;
        let g = 1;
        if (fi > 0 && t < fs + fi) g = Math.min(g, Math.max(0, (t - fs) / fi));
        if (fo > 0 && end - t < fo) g = Math.min(g, Math.max(0, (end - t) / fo));
        el.volume = Math.max(0, Math.min(1, base * g));
        // Musik ikut memudar dgn gain yg sama (fade video = fade backsound).
        if (el._veBgmEl && el._veBgmVol != null) el._veBgmEl.volume = Math.max(0, Math.min(1, el._veBgmVol * g));
      };
      el.addEventListener("timeupdate", el._veFadeHandler);
    }
  } else if (el._veAudioApplied) {
    el.volume = 1;
    el.muted = false;
    el._veAudioApplied = false;
  }
}

// 25 Jul 2026: BACKSOUND saat playback — <audio> tersembunyi disinkronkan dgn
// <video> (play/pause/seeking/ended). Sumber: preset sintetis / blob IndexedDB /
// URL cloud. Volume musik (el._veBgmVol) ikut diramp handler fade. Async + token
// guard: resolusi yg kalah cepat (ganti video sebelum load selesai) dibatalkan.
async function _applyPlaybackMusic(el, edit) {
  if (!el) return;
  const tok = (el._veBgmToken = (el._veBgmToken || 0) + 1);
  const cleanup = () => {
    if (el._veBgmEl) { try { el._veBgmEl.pause(); } catch {} el._veBgmEl.removeAttribute("src"); }
    el._veBgmVol = null;
    if (el._veBgmBound) {
      ["play", "pause", "seeking", "ended"].forEach(ev => el.removeEventListener(ev, el._veBgmBound));
      el._veBgmBound = null;
    }
  };
  const audio = edit && edit.audio;
  if (!audio || (!audio.preset && !audio.key && !audio.url)) { cleanup(); return; }
  const url = await _veBgmResolveUrl(audio);
  if (tok !== el._veBgmToken) return; // tergantikan panggilan lebih baru
  if (!url) { cleanup(); return; }
  if (!el._veBgmEl) { el._veBgmEl = document.createElement("audio"); el._veBgmEl.preload = "auto"; }
  const bgm = el._veBgmEl;
  bgm.src = url;
  bgm.loop = audio.loop !== false; // default: loop ON
  el._veBgmVol = Math.max(0, Math.min(1, (audio.volume != null ? audio.volume : 40) / 100));
  bgm.volume = el._veBgmVol;
  if (!el._veBgmBound) {
    el._veBgmBound = function (ev) {
      const b = el._veBgmEl;
      if (!b || !b.src) return;
      if (ev.type === "play") {
        if (b.duration && el.currentTime < b.duration) { try { b.currentTime = el.currentTime; } catch {} }
        b.play().catch(() => {});
      } else if (ev.type === "pause") {
        b.pause();
      } else if (ev.type === "seeking") {
        if (b.duration) { try { b.currentTime = el.currentTime % b.duration; } catch {} }
      } else if (ev.type === "ended") {
        b.pause(); try { b.currentTime = 0; } catch {}
      }
    };
    ["play", "pause", "seeking", "ended"].forEach(ev => el.addEventListener(ev, el._veBgmBound));
  }
}
