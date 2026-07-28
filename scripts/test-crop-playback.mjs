// Tes kecil (tanpa framework) untuk mesin playback edit di public/legacy/
// video-edit-playback.js (dipakai app + watch sejak 28 Jul 2026). Fungsi ASLI
// diekstrak dari file bersama itu lalu dijalankan dengan elemen tiruan.
// Jalan: node scripts/test-crop-playback.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../public/legacy/video-edit-playback.js", import.meta.url), "utf8");
const m = src.match(/function applyVideoEditCss\(el, edit\) \{[\s\S]*?\n\}/);
const mText = src.match(/function _applyPlaybackTextOverlay\(el, edit\) \{[\s\S]*?\n\}/);
const mAudio = src.match(/function _applyPlaybackAudio\(el, edit\) \{[\s\S]*?\n\}/);
const mResolve = src.match(/async function _veBgmResolveUrl\(audio\) \{[\s\S]*?\n\}/);
const mMusic = src.match(/async function _applyPlaybackMusic\(el, edit\) \{[\s\S]*?\n\}/);
if (!m || !mText || !mAudio || !mResolve || !mMusic) { console.error("FAIL: salah satu fungsi playback tidak ditemukan di script.js"); process.exit(1); }

// Stub minimal lingkungan browser yang disentuh fungsi.
globalThis.document = {
  addEventListener() {},
  createElement() {
    return {
      style: {}, dataset: {}, className: "", textContent: "",
      pause() {}, removeAttribute() {}, play() { return Promise.resolve(); },
      remove() { const i = (this.__parent ? this.__parent.kids : []).indexOf(this); if (i >= 0) this.__parent.kids.splice(i, 1); },
    };
  },
};
eval(m[0] + "\n" + mText[0] + "\n" + mAudio[0] + "\n" + mResolve[0] + "\n" + mMusic[0] + "\nglobalThis.applyVideoEditCss = applyVideoEditCss; globalThis._veBgmResolveUrl = _veBgmResolveUrl;");

function mockVideo(vw, vh, bw, bh) {
  return {
    style: {}, // properti diset apa adanya (transform/filter/clipPath)
    _h: {}, // listener tersimpan per tipe event (loadedmetadata, timeupdate, dst)
    videoWidth: vw, videoHeight: vh,
    clientWidth: bw, clientHeight: bh,
    addEventListener(t, fn) { this._h[t] = fn; },
    removeEventListener(t) { delete this._h[t]; },
  };
}

function mockParent() {
  return {
    kids: [],
    querySelector() { return this.kids.find(k => k.className.includes("ve-playback-text")) || null; },
    appendChild(c) { c.__parent = this; this.kids.push(c); },
  };
}

let failed = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) console.log(`  expected: ${expected}\n  actual  : ${actual}`);
}

// A — video 16:9 di box 16:9, crop kuadran kiri-atas → region diskala 2x & ter-center.
{
  const el = mockVideo(1280, 720, 640, 360);
  applyVideoEditCss(el, { aspect: "bebas", crop: { x: 0, y: 0, w: 50, h: 50 } });
  check("A.clipPath", el.style.clipPath, "inset(0% 50% 50% 0%)");
  check("A.transform", el.style.transform,
    "translate(0%, 0%) rotate(0deg) scale(1) scaleX(1) scaleY(1) translate(50%, 50%) scale(2)");
}

// B — metadata belum termuat (videoWidth 0) → fallback clip di posisi asal, tanpa transform crop.
{
  const el = mockVideo(0, 0, 640, 360);
  applyVideoEditCss(el, { aspect: "bebas", crop: { x: 10, y: 10, w: 50, h: 50 } });
  check("B.clipPath", el.style.clipPath, "inset(10% 40% 40% 10%)");
  check("B.transform", el.style.transform,
    "translate(0%, 0%) rotate(0deg) scale(1) scaleX(1) scaleY(1)");
}

// C — edit null → semua styling bersih.
{
  const el = mockVideo(1280, 720, 640, 360);
  applyVideoEditCss(el, { aspect: "bebas", crop: { x: 0, y: 0, w: 50, h: 50 } });
  applyVideoEditCss(el, null);
  check("C.transform", el.style.transform, "");
  check("C.clipPath", el.style.clipPath, "");
  check("C.filter", el.style.filter, "");
}

// D — video portrait 1:1 di box landscape 2:1 (konten pillarbox): clip dipetakan
// lewat rect konten, region tetap ter-center.
{
  const el = mockVideo(1000, 1000, 200, 100);
  applyVideoEditCss(el, { aspect: "bebas", crop: { x: 0, y: 0, w: 100, h: 50 } });
  check("D.clipPath", el.style.clipPath, "inset(0% 25% 50% 25%)");
  check("D.transform", el.style.transform,
    "translate(0%, 0%) rotate(0deg) scale(1) scaleX(1) scaleY(1) translate(0%, 50%) scale(2)");
}

// E — video ultra-wide (8:1) di box 4:1 (konten letterbox): region sudah selebar
// box → scale 1 (tidak membesar berlebihan), tetap ter-center.
{
  const el = mockVideo(4000, 500, 400, 100);
  applyVideoEditCss(el, { aspect: "bebas", crop: { x: 0, y: 25, w: 100, h: 50 } });
  check("E.clipPath", el.style.clipPath, "inset(37.5% 0% 37.5% 0%)");
  check("E.transform", el.style.transform,
    "translate(0%, 0%) rotate(0deg) scale(1) scaleX(1) scaleY(1) translate(0%, 0%) scale(1)");
}

// F — crop + zoom user: transform user dirangkai SEBELUM transform crop (crop berlaku duluan).
{
  const el = mockVideo(1280, 720, 640, 360);
  applyVideoEditCss(el, { aspect: "bebas", crop: { x: 0, y: 0, w: 50, h: 50 }, zoom: 150 });
  check("F.transform", el.style.transform,
    "translate(0%, 0%) rotate(0deg) scale(1.5) scaleX(1) scaleY(1) translate(50%, 50%) scale(2)");
}

// G — teks hasil edit dirender sebagai overlay saudara <video> (25 Jul 2026).
{
  const el = mockVideo(1280, 720, 640, 360);
  el.parentElement = mockParent();
  applyVideoEditCss(el, { aspect: "original", text: "Halo dunia", textPos: "top", textSize: 32, textColor: "#ff0000", textFont: "'JetBrains Mono'" });
  const ov = el.parentElement.kids[0];
  check("G.overlayAda", !!ov, true);
  check("G.class", ov.className, "ve-text-overlay ve-playback-text");
  check("G.isi", ov.textContent, "Halo dunia");
  check("G.ukuran", ov.style.fontSize, "32px");
  check("G.warna", ov.style.color, "#ff0000");
  check("G.font", ov.style.fontFamily, "'JetBrains Mono', sans-serif");
  check("G.posisi", ov.dataset.pos, "top");
  check("G.tampil", ov.style.display, "block");
}

// H — edit tanpa teks → overlay dihapus dari parent. (Font default = Inter.)
{
  const el = mockVideo(1280, 720, 640, 360);
  el.parentElement = mockParent();
  applyVideoEditCss(el, { aspect: "original", text: "Ada", textPos: "bottom", textSize: 24, textColor: "#fff" });
  check("H.fontDefault", el.parentElement.kids[0].style.fontFamily, "Inter, sans-serif");
  applyVideoEditCss(el, { aspect: "original", text: "  " });
  check("H.overlayHilang", el.parentElement.kids.length, 0);
}

// I — reset (edit null) → overlay ikut dihapus.
{
  const el = mockVideo(1280, 720, 640, 360);
  el.parentElement = mockParent();
  applyVideoEditCss(el, { aspect: "original", text: "Ada" });
  applyVideoEditCss(el, null);
  check("I.overlayHilang", el.parentElement.kids.length, 0);
}

// J — hue dari slider Hue (dikembalikan 25 Jul) ikut diterapkan di filter playback.
{
  const el = mockVideo(1280, 720, 640, 360);
  applyVideoEditCss(el, { aspect: "original", hue: 45 });
  check("J.filterHue", el.style.filter.includes("hue-rotate(45deg)"), true);
}

// K — audio hasil edit (25 Jul): volume/muted diterapkan; hanya direset bila
// sebelumnya kita yg menerapkan (volume manual user tak tertimpa).
{
  const el = mockVideo(1280, 720, 640, 360);
  applyVideoEditCss(el, { aspect: "original", volume: 40, muted: true });
  check("K.volume", el.volume, 0.4);
  check("K.muted", el.muted, true);
  applyVideoEditCss(el, { aspect: "original" }); // edit lain tanpa field audio
  check("K.resetVolume", el.volume, 1);
  check("K.resetMuted", el.muted, false);
  el.volume = 0.25; // anggap user atur manual di player (tanpa flag kita)
  applyVideoEditCss(el, { aspect: "original" });
  check("K.manualAman", el.volume, 0.25);
  applyVideoEditCss(el, { aspect: "original", volume: 60 });
  applyVideoEditCss(el, null);
  check("K.nullReset", el.volume, 1);
  check("K.nullResetMuted", el.muted, false);
}

// L — fade in/out playback (25 Jul): volume diramp mengikuti posisi putar;
// handler fade dilepas saat edit tanpa audio / reset null.
{
  const el = mockVideo(1280, 720, 640, 360);
  el.duration = 10;
  applyVideoEditCss(el, { aspect: "original", volume: 100, fadeIn: 2, fadeOut: 2 });
  el.currentTime = 1; el._veFadeHandler();
  check("L.fadeInTengah", el.volume, 0.5);
  el.currentTime = 3; el._veFadeHandler();
  check("L.fadeNormal", el.volume, 1);
  el.currentTime = 9; el._veFadeHandler();
  check("L.fadeOutTengah", el.volume, 0.5);
  el.currentTime = 9.9; el._veFadeHandler();
  check("L.fadeOutUjung", Math.round(el.volume * 100) / 100, 0.05);
  applyVideoEditCss(el, { aspect: "original" }); // tanpa audio → handler lepas + volume pulih
  check("L.handlerLepas", el._veFadeHandler == null, true);
  check("L.volumePulih", el.volume, 1);
}

// M — backsound playback (25 Jul): di node sumber audio tak bisa di-resolve
// (indexedDB/WebAudio tak ada) → helper wajib cleanup rapi & tak crash.
{
  const el = mockVideo(1280, 720, 640, 360);
  el._veBgmEl = { pause() {}, removeAttribute() {}, volume: 0.4 };
  el._veBgmVol = 0.4;
  el._veBgmBound = () => {};
  applyVideoEditCss(el, { aspect: "original", audio: { key: "ve-audio-x", volume: 40, loop: true } });
  await new Promise(r => setTimeout(r, 0)); // biarkan resolusi async selesai
  check("M.bgmVolBersih", el._veBgmVol == null, true);
  check("M.boundLepas", el._veBgmBound == null, true);
}

// N — backsound URL cloud (25 Jul, tahap online): url https dipakai langsung
// (canonical utk semua penonton), & bersih saat reset.
{
  const url = "https://cdn.example.com/bgm.mp3";
  check("N.resolverUrl", await _veBgmResolveUrl({ url }), url);
  const el = mockVideo(1280, 720, 640, 360);
  applyVideoEditCss(el, { aspect: "original", audio: { url, volume: 40, loop: true } });
  await new Promise(r => setTimeout(r, 0));
  check("N.bgmSrc", el._veBgmEl && el._veBgmEl.src, url);
  check("N.bgmVol", el._veBgmVol, 0.4);
  check("N.bgmLoop", el._veBgmEl && el._veBgmEl.loop, true);
  applyVideoEditCss(el, null);
  check("N.bgmBersih", el._veBgmVol == null, true);
}

// O — trim & speed ditegakkan saat playback (28 Jul): rate, _veTrimEnd, anchor fade.
{
  const el = mockVideo(1280, 720, 640, 360);
  el.duration = 100;
  applyVideoEditCss(el, { aspect: "original", speed: 2, trimStart: 5, trimEnd: 10, volume: 100, fadeIn: 2, fadeOut: 2 });
  check("O.rate", el.playbackRate, 2);
  check("O.trimEndSet", el._veTrimEnd, 10);
  el.currentTime = 6; el._veFadeHandler();   // (6-5)/2 = 0.5
  check("O.fadeInTrim", el.volume, 0.5);
  el.currentTime = 7; el._veFadeHandler();   // di dalam rentang penuh
  check("O.fadeNormal", el.volume, 1);
  el.currentTime = 9; el._veFadeHandler();   // (10-9)/2 = 0.5
  check("O.fadeOutTrim", el.volume, 0.5);
  applyVideoEditCss(el, null);
  check("O.rateReset", el.playbackRate, 1);
  check("O.trimReset", el._veTrimEnd, 0);
}

console.log(failed ? `\n${failed} tes GAGAL` : "\nSemua tes PASS");
process.exit(failed ? 1 : 0);
