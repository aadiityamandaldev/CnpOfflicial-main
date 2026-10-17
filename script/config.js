var CNPTV_CONF = {
  siteName: "CnpTV",

  build: "23",
  heroSlideDuration: 10000,
  maxHeroMatches: 8,
  heroFeedUrl: "",
  eventRefreshMs: 300000,

  apis: {
    football:            "https://sonujson-v5.pages.dev/Data/events/football.json",
    cricket:             "https://sonujson-v5.pages.dev/Data/events/cricket.json",
    willow:              "https://sonujson-v5.pages.dev/Data/willow.json",
    willowLive:          "https://sonujson-v5.pages.dev/Data/willow.json",
    willowSnapshot:      "",
    fancode:             "https://raw.githubusercontent.com/kajju027/Fancode-Events-Json/refs/heads/main/fancode.json",
    fanCode:             "https://raw.githubusercontent.com/kajju027/Fancode-Events-Json/refs/heads/main/fancode.json",
    fancodeSnapshot:     "",
    fanCodeSnapshot:     "",
    worldSports:         "https://matchdekho.in/api/world-sports.json",
    worldSportsSnapshot: "",
    sonyLiv:             "https://raw.githubusercontent.com/kajju027/SonyLiv-Events-Json/refs/heads/main/sonyliv.json",
    sony:                "https://raw.githubusercontent.com/kajju027/SonyLiv-Events-Json/refs/heads/main/sonyliv.json"
  },

  sections: {
    football:    { link: "/watch/?src=football", idMode: "param", idKey: "id", viewAllLink: "/events/?sport=football" },
    cricket:     { link: "/watch/?src=cricket",  idMode: "param", idKey: "id", viewAllLink: "/events/?sport=cricket"  },
    willow:      { link: "/az/",                 idMode: "param", idKey: "id", viewAllLink: "/events/?sport=willow"   },
    fancode:     { link: "/fc/play/",            idMode: "param", idKey: "id", viewAllLink: "/events/?sport=fancode"  },
    worldSports: { link: "",                     idMode: "param", idKey: "id", viewAllLink: "/events/?sport=world-sports" },
    sonyLiv:     { link: "/player/sony",         idMode: "param", idKey: "id", viewAllLink: "/events/?sport=sony-liv" }
  },

  cardLimit: 10,
  upcomingClickable: false,

  labels: {
    watchNow:   "Watch Now",
    comingSoon: "Coming Soon",
    viewAll:    "View All Events"
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

window.CNPTV_CONFIG      = CNPTV_CONF;
window.MATCHDEKHO_CONFIG = CNPTV_CONF;

window.CnpTVHelper = (function () {
  function buildUrl(sectionCfg, eventId) {
    var base = String(sectionCfg && sectionCfg.link || "");
    if (!base) return "";
    if (!eventId) return base;
    var mode = String(sectionCfg.idMode || "param");
    var key  = String(sectionCfg.idKey  || "id");
    if (mode === "path") {
      return base.replace(/\/$/, "") + "/" + encodeURIComponent(eventId);
    }
    var sep = base.indexOf("?") > -1 ? "&" : "?";
    return base + sep + encodeURIComponent(key) + "=" + encodeURIComponent(eventId);
  }

  function extractId(item) {
    if (!item || typeof item !== "object") return "";
    return String(item.id || item.matchId || item.match_id || item.matchID || item.stream_id || "");
  }

  function toTitleCase(str) {
    return String(str || "").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  return { buildUrl: buildUrl, extractId: extractId, toTitleCase: toTitleCase };
})();

if (typeof CNPTV_CONF !== "undefined" && CNPTV_CONF) {
  CNPTV_CONF.heroMatches = [
    {
      "tournament": "WEST INDIES TOUR OF INDIA - 3RD T20I",
      "homeTeam": {
        "name": "India",
        "logo": "https://flagpedia.net/data/flags/w1160/in.webp"
      },
      "awayTeam": {
        "name": "West Indies",
        "logo": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Cricket_West_Indies_flag_2017.svg/1920px-Cricket_West_Indies_flag_2017.svg.png"
      },
      "poster": "https://img10.hotstar.com/image/upload/f_auto,q_90,w_1920/sources/r1/cms/prod/9280/1791259109280-i",
      "date": "14 OCT 2026, 07:00 PM",
      "watchUrl": "/home/live/ind-vs-wi.html"
    }
  ];
}
