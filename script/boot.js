(function () {
  "use strict";

  var STAMP = String(Date.now());
  var FILE_MODE = location.protocol === "file:";

  /* ── Script load order ──────────────────────────────────────────────────
     FIX: scroll-anim.js was missing from this list. Without it the scroll
     hint never faded out on scroll, and section entrance animations never
     ran. It now loads after platform-status.js and before landing-news.js.
  ───────────────────────────────────────────────────────────────────────── */
  var FILES = [
    "app.js",
    "live-events.js",
    "willow-live.js",
    "fancode.js",
    "world-sports.js",
    "sony-liv.js",
    "platform-status.js",
    "scroll-anim.js",
    "landing-news.js"
  ];

  var STARTED = false;

  /* Built-in fallback config — used only when script/config.js fails to load. */
  var FALLBACK = {
    siteName: "CnpTV",
    heroSlideDuration: 10000,
    maxHeroMatches: 8,
    heroFeedUrl: "",
    apis: {
      football:          "https://sonujson-v5.pages.dev/Data/events/football.json",
      cricket:           "https://sonujson-v5.pages.dev/Data/events/cricket.json",
      willow:            "https://sonujson-v5.pages.dev/Data/willow.json",
      willowLive:        "https://sonujson-v5.pages.dev/Data/willow.json",
      willowSnapshot:    "",
      fancode:           "https://raw.githubusercontent.com/kajju027/Fancode-Events-Json/refs/heads/main/fancode.json",
      fanCode:           "https://raw.githubusercontent.com/kajju027/Fancode-Events-Json/refs/heads/main/fancode.json",
      fancodeSnapshot:   "",
      fanCodeSnapshot:   "",
      worldSports:       "https://matchdekho.in/api/world-sports.json",
      worldSportsSnapshot: "",
      sonyLiv:           "https://raw.githubusercontent.com/kajju027/SonyLiv-Events-Json/refs/heads/main/sonyliv.json",
      sony:              "https://raw.githubusercontent.com/kajju027/SonyLiv-Events-Json/refs/heads/main/sonyliv.json"
    },
    playerBase: "",
    routes: {
      willowPlayer:  "/az/",
      fancodePlayer: "/fc/play/",
      sonyPlayer:    "/player/sony"
    },
    willowPlayerMode: "stream",
    heroMatches: []
  };

  /* Dynamically loads a script and returns a Promise. */
  function load(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      var finished = false;
      var timeout;

      function finish(error) {
        if (finished) return;
        finished = true;
        window.clearTimeout(timeout);
        s.onload  = null;
        s.onerror = null;
        if (error) reject(error); else resolve();
      }

      s.src     = url;
      s.onload  = function () { finish(); };
      s.onerror = function () { finish(new Error("Script failed to load: " + url)); };
      timeout   = window.setTimeout(function () {
        finish(new Error("Script timed out: " + url));
      }, 8000);
      document.head.appendChild(s);
    });
  }

  /* Appends all section scripts to <head> in declared order (async=false
     preserves execution order while allowing parallel network loads). */
  function startScripts() {
    if (STARTED) return;
    STARTED = true;
    FILES.forEach(function (name) {
      var s   = document.createElement("script");
      s.src   = "script/" + name + (FILE_MODE ? "" : "?t=" + STAMP);
      s.async = false;
      document.head.appendChild(s);
    });
  }

  /* Merges config into both global aliases then kicks off section scripts. */
  function boot() {
    var cfg = window.CNPTV_CONFIG || window.MATCHDEKHO_CONFIG;
    if (!cfg || typeof cfg !== "object") cfg = FALLBACK;
    window.CNPTV_CONFIG      = cfg;
    window.MATCHDEKHO_CONFIG = cfg;
    startScripts();
  }

  /* Load config first; fall back to built-ins on any failure. */
  load("script/config.js" + (FILE_MODE ? "" : "?t=" + STAMP))
    .then(boot)
    .catch(function () {
      if (window.console && console.warn) {
        console.warn("[boot] config.js did not load, using built-in defaults");
      }
      boot();
    });
})();
