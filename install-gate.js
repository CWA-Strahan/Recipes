/* install-gate.js — CWA Strahan Recipes
   A gentle "put this on your home screen" walkthrough, aimed at readers
   who have never installed a web app before.

   - Already installed → does nothing, ever.
   - Android/Chrome    → warm card, Install button fires the real native prompt.
   - iPhone/iPad Safari→ card, then a big-type 3-step Add-to-Home-Screen guide.
   - "Not now"         → quiet for 14 days.
   All styles prefixed ig- so nothing fights the app CSS. */

(function () {
  "use strict";

  var APP_NAME = "CWA Recipes";
  var DISMISS_DAYS = 14;
  var KEY = "cwa-install-gate";

  /* ---------- state ---------- */
  var standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  if (standalone) return;

  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  if (state.installed) return;
  if (state.dismissedAt && Date.now() - state.dismissedAt < DISMISS_DAYS * 864e5) return;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var ua = navigator.userAgent;
  var isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isIPad = /iPad/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var iosNotSafari = isIOS && /CriOS|FxiOS|EdgiOS/.test(ua);

  var deferredPrompt = null, banner = null, sheet = null;

  /* ---------- styles ---------- */
  var css =
    ".ig-banner{position:fixed;left:12px;right:12px;bottom:12px;z-index:9000;" +
      "background:#FBF8EF;border:2px solid #C29A45;border-radius:14px;" +
      "box-shadow:0 8px 30px rgba(42,41,37,.25);padding:16px;" +
      "font-family:'Nunito Sans',system-ui,sans-serif;color:#2A2925;" +
      "max-width:430px;margin:0 auto;font-size:17px;line-height:1.45}" +
    ".ig-banner h4{margin:0 0 6px;font-family:Georgia,serif;font-size:20px;color:#21472B}" +
    ".ig-banner p{margin:0 0 12px}" +
    ".ig-row{display:flex;gap:10px}" +
    ".ig-btn{flex:1;border:none;border-radius:10px;padding:14px;font:inherit;" +
      "font-weight:700;cursor:pointer;min-height:50px}" +
    ".ig-yes{background:#2E5A38;color:#F3EFE2}" +
    ".ig-no{background:none;border:1.5px solid #DED3B8;color:#6E6A5E}" +
    ".ig-sheet{position:fixed;inset:0;z-index:9100;background:rgba(33,32,28,.55);" +
      "display:flex;align-items:flex-end;justify-content:center}" +
    ".ig-card{background:#F6F1E4;border-radius:18px 18px 0 0;max-width:480px;width:100%;" +
      "padding:22px 20px 30px;font-family:'Nunito Sans',system-ui,sans-serif;" +
      "color:#2A2925;font-size:18px;line-height:1.5;max-height:85vh;overflow:auto}" +
    ".ig-card h3{margin:0 0 14px;font-family:Georgia,serif;font-size:23px;color:#21472B}" +
    ".ig-step{display:flex;gap:14px;margin:0 0 16px;align-items:flex-start}" +
    ".ig-num{flex:none;width:34px;height:34px;border-radius:50%;background:#2E5A38;" +
      "color:#F3EFE2;display:flex;align-items:center;justify-content:center;" +
      "font-weight:700;font-size:17px}" +
    ".ig-hint{font-size:15px;color:#6E6A5E;margin-top:4px}" +
    ".ig-glyph{display:inline-block;vertical-align:-4px;margin:0 2px}" +
    ".ig-done{width:100%;border:none;border-radius:10px;padding:15px;font:inherit;" +
      "font-weight:700;background:#2E5A38;color:#F3EFE2;min-height:52px;cursor:pointer}" +
    "@media (prefers-reduced-motion:no-preference){" +
      ".ig-banner{animation:ig-up .35s ease}" +
      "@keyframes ig-up{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}}";

  function injectStyles() {
    if (document.getElementById("ig-styles")) return;
    var s = document.createElement("style");
    s.id = "ig-styles"; s.textContent = css;
    document.head.appendChild(s);
  }

  var GLYPH_SHARE =
    '<svg class="ig-glyph" width="20" height="24" viewBox="0 0 20 24" fill="none" ' +
    'stroke="#2E5A38" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M10 14V2M6 6l4-4 4 4"/><path d="M4 10H3v12h14V10h-1"/></svg>';
  var GLYPH_ADD =
    '<svg class="ig-glyph" width="20" height="20" viewBox="0 0 20 20" fill="none" ' +
    'stroke="#2E5A38" stroke-width="1.8" stroke-linecap="round">' +
    '<rect x="1.5" y="1.5" width="17" height="17" rx="4"/><path d="M10 6v8M6 10h8"/></svg>';

  /* ---------- banner ---------- */
  function showBanner(kind) {
    if (banner) return;
    injectStyles();
    banner = document.createElement("div");
    banner.className = "ig-banner";
    banner.setAttribute("role", "dialog");
    banner.innerHTML =
      "<h4>Keep " + APP_NAME + " handy</h4>" +
      "<p>Add it to your home screen and it opens like any other app — recipe book always in your pocket.</p>" +
      '<div class="ig-row">' +
      '<button class="ig-btn ig-yes">' + (kind === "android" ? "Install" : "Show me how") + "</button>" +
      '<button class="ig-btn ig-no">Not now</button></div>';
    document.body.appendChild(banner);

    banner.querySelector(".ig-no").onclick = function () {
      state.dismissedAt = Date.now(); save(); removeBanner();
    };
    banner.querySelector(".ig-yes").onclick = function () {
      if (kind === "android" && deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (choice) {
          deferredPrompt = null;
          if (!(choice && choice.outcome === "accepted")) {
            state.dismissedAt = Date.now(); save();
          }
          removeBanner();
        });
      } else {
        showIOSSheet();
      }
    };
  }
  function removeBanner() { if (banner) { banner.remove(); banner = null; } }

  /* ---------- iOS walkthrough ---------- */
  function showIOSSheet() {
    if (sheet) return;
    injectStyles();
    var where = isIPad
      ? "in the <b>top corner</b> of the screen"
      : "at the <b>bottom</b> of the screen";
    var steps = [];
    if (iosNotSafari) {
      steps.push("First, open this page in <b>Safari</b> (the blue compass icon), then follow these steps there.");
    }
    steps.push("Tap the <b>Share</b> button " + GLYPH_SHARE + " " + where + "." +
      '<div class="ig-hint">It looks like a square with an arrow pointing up.</div>');
    steps.push("Scroll down the list and tap <b>Add to Home Screen</b> " + GLYPH_ADD + ".");
    steps.push("Tap <b>Add</b> in the top corner. Done — look for the CWA recipe-book icon.");

    sheet = document.createElement("div");
    sheet.className = "ig-sheet";
    sheet.innerHTML =
      '<div class="ig-card"><h3>Add ' + APP_NAME + " to your home screen</h3>" +
      steps.map(function (s, i) {
        return '<div class="ig-step"><div class="ig-num">' + (i + 1) + "</div><div>" + s + "</div></div>";
      }).join("") +
      '<button class="ig-done">Got it</button></div>';
    document.body.appendChild(sheet);
    sheet.querySelector(".ig-done").onclick = function () {
      state.dismissedAt = Date.now(); save();
      sheet.remove(); sheet = null; removeBanner();
    };
    sheet.onclick = function (e) { if (e.target === sheet) sheet.querySelector(".ig-done").click(); };
  }

  /* ---------- wiring ---------- */
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(function () { showBanner("android"); }, 1200);
  });

  window.addEventListener("appinstalled", function () {
    state.installed = true; state.dismissedAt = null; save();
    removeBanner(); if (sheet) { sheet.remove(); sheet = null; }
  });

  if (isIOS) {
    setTimeout(function () { showBanner("ios"); }, 1200);
  }
})();
