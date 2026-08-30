/* Bustan - the working parts.

   Local-first: everything lives in localStorage under one key. Weather is an
   enhancement, never a dependency - every screen renders from cache, and the
   app is fully usable with the radio off. */
(function () {
  "use strict";
  var KEY = "bustan.v1";
  var SP = window.SPECIES, BYID = window.SPECIES_BY_ID, Sprites = window.Sprites;

  /* ================= state ================= */
  var S = {
    loc: null,               // {lat, lon, elev, label}
    plants: [],
    forecast: null,          // {fetched, days:[{date,tmax,tmin,rain,et0,wind,rh,uv}]}
    lastTick: null,
    xp: 0,
    prefs: { arabic: true }
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var d = JSON.parse(raw); for (var k in d) if (d.hasOwnProperty(k)) S[k] = d[k]; }
    } catch (e) { /* corrupt or blocked storage - carry on with defaults */ }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); return true; }
    catch (e) { return false; }
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ================= dates & seasons ================= */
  function today() { var d = new Date(); return d.toISOString().slice(0, 10); }
  function dayNum(iso) { return Math.floor(new Date(iso + "T00:00:00Z").getTime() / 86400000); }
  function daysBetween(a, b) { return dayNum(b) - dayNum(a); }
  function addDays(iso, n) { return new Date((dayNum(iso) + n) * 86400000).toISOString().slice(0, 10); }
  function month() { return new Date().getMonth() + 1; }

  var SEASONS = {
    autumn: { m: [9, 10, 11], en: "Autumn", ar: "الخريف", note: "The best sowing window of the year." },
    winter: { m: [12, 1, 2],  en: "Winter", ar: "الشتاء", note: "Rain does the watering. Protect what is tender." },
    spring: { m: [3, 4, 5],   en: "Spring", ar: "الربيع", note: "Plant the summer crop before the heat lands." },
    summer: { m: [6, 7, 8],   en: "Summer", ar: "الصيف", note: "Survival season. Shade, water early, sow almost nothing." }
  };
  function season(m) {
    m = m || month();
    for (var k in SEASONS) if (SEASONS[k].m.indexOf(m) > -1) return k;
    return "spring";
  }

  /* ================= the watering engine ================= */
  var KC = {
    fruit:     [0.40, 1.05, 0.75],
    leafy:     [0.70, 1.00, 0.95],
    herb:      [0.60, 0.90, 0.80],
    root:      [0.50, 1.05, 0.70],
    tree:      [0.50, 0.85, 0.70],
    succulent: [0.15, 0.30, 0.20]
  };
  var KEXP = { full: 1.0, part: 0.75, shade: 0.55, indoor: 0.35 };
  var KPOT = { terracotta: 1.30, plastic: 1.00, selfwater: 0.70, ground: 1.00 };
  var CAP  = { small: { mm: 8, dep: 0.50 }, medium: { mm: 14, dep: 0.50 },
               large: { mm: 22, dep: 0.55 }, ground: { mm: 35, dep: 0.60 } };

  function stageOf(p) {
    var sp = BYID[p.sid]; if (!sp) return 2;
    var age = daysBetween(p.sown, today());
    if (age < 0) return 0;
    if (age < sp.germ) return 0;
    if (age < sp.germ + 14) return 1;
    var span = Math.max(30, sp.days - sp.germ);
    var f = (age - sp.germ) / span;
    if (f < 0.35) return 2;
    if (f < 0.8) return 3;
    return 4;
  }
  function kcFor(p) {
    var sp = BYID[p.sid], k = KC[sp.kc] || KC.herb, st = stageOf(p);
    return st <= 2 ? k[0] : st === 3 ? k[1] : k[2];
  }
  function capFor(p) { return CAP[p.size] || CAP.medium; }

  // one day of water balance for one plant
  function tickDay(p, et0, rain) {
    var sp = BYID[p.sid]; if (!sp) return;
    var sheltered = p.mat === "indoor" || p.sun === "indoor";
    var etc = et0 * kcFor(p) * (KEXP[p.sun] || 1) * (KPOT[p.mat] || 1);
    var peff = sheltered ? 0 : rain * 0.8;
    // A pot cannot lose more water than it holds. Cap above capacity so
    // "badly overdue" still reads as worse than "due", without the number
    // running away over a fortnight of neglect.
    var ceiling = capFor(p).mm * 1.5;
    p.def = Math.max(0, Math.min(ceiling, (p.def || 0) + etc - peff));
  }
  function waterStatus(p) {
    var sp = BYID[p.sid], cap = capFor(p);
    var limit = cap.mm * cap.dep;
    if (sp.w === "dry") {
      var minDry = season() === "winter" ? 21 : 7;
      var since = p.lastWater ? daysBetween(p.lastWater, today()) : 99;
      var ready = (p.def || 0) >= cap.mm * 0.9 && since >= minDry;
      return { due: ready, pct: Math.min(1, (p.def || 0) / (cap.mm * 0.9)),
               why: since < minDry ? ("resting - " + (minDry - since) + " more dry day" + (minDry - since === 1 ? "" : "s")) : null };
    }
    return { due: (p.def || 0) >= limit, pct: Math.min(1, (p.def || 0) / limit), why: null };
  }

  // replay every day since we last ran, so a week away still lands correctly
  function runEngine() {
    if (!S.forecast || !S.forecast.days.length) return;
    var t = today();
    var from = S.lastTick ? addDays(S.lastTick, 1) : t;
    if (daysBetween(from, t) < 0) { S.lastTick = t; return; }
    var byDate = {};
    S.forecast.days.forEach(function (d) { byDate[d.date] = d; });
    for (var d = from; daysBetween(d, t) >= 0; d = addDays(d, 1)) {
      var w = byDate[d];
      if (!w) continue;
      S.plants.forEach(function (p) {
        if (daysBetween(p.sown, d) < 0) return;
        if (p.lastWater && daysBetween(p.lastWater, d) < 0) return;
        tickDay(p, w.et0 || 0, w.rain || 0);
      });
    }
    S.lastTick = t;
  }

  /* ================= weather ================= */
  var FULL = "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,wind_speed_10m_max,uv_index_max,relative_humidity_2m_min,weather_code";
  var SAFE = "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,wind_speed_10m_max,weather_code";

  function fetchWeather(cb) {
    if (!S.loc) { cb(new Error("no location")); return; }
    var base = "https://api.open-meteo.com/v1/forecast?latitude=" + S.loc.lat.toFixed(3) +
               "&longitude=" + S.loc.lon.toFixed(3) + "&timezone=auto&past_days=7&forecast_days=7&daily=";
    function go(vars, isRetry) {
      fetch(base + vars).then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      }).then(function (j) {
        if (!j.daily || !j.daily.time) throw new Error("no daily block");
        var D = j.daily, days = D.time.map(function (t, i) {
          return {
            date: t,
            tmax: D.temperature_2m_max ? D.temperature_2m_max[i] : null,
            tmin: D.temperature_2m_min ? D.temperature_2m_min[i] : null,
            rain: D.precipitation_sum ? (D.precipitation_sum[i] || 0) : 0,
            et0:  D.et0_fao_evapotranspiration ? (D.et0_fao_evapotranspiration[i] || 0) : 0,
            wind: D.wind_speed_10m_max ? D.wind_speed_10m_max[i] : null,
            uv:   D.uv_index_max ? D.uv_index_max[i] : null,
            rh:   D.relative_humidity_2m_min ? D.relative_humidity_2m_min[i] : null,
            code: D.weather_code ? D.weather_code[i] : null
          };
        });
        if (typeof j.elevation === "number" && S.loc) S.loc.elev = j.elevation;
        S.forecast = { fetched: new Date().toISOString(), days: days };
        cb(null, S.forecast);
      }).catch(function (e) {
        // the humidity field is the one likely to be rejected; drop it and retry once
        if (!isRetry) { go(SAFE, true); return; }
        cb(e);
      });
    }
    go(FULL, false);
  }
  function forecastFor(iso) {
    if (!S.forecast) return null;
    for (var i = 0; i < S.forecast.days.length; i++) if (S.forecast.days[i].date === iso) return S.forecast.days[i];
    return null;
  }
  function staleness() {
    if (!S.forecast) return null;
    var h = (Date.now() - new Date(S.forecast.fetched).getTime()) / 3600000;
    return h;
  }

  /* ================= warnings ================= */
  function alerts() {
    var out = [];
    if (!S.forecast) return out;
    var t = today();
    for (var i = 0; i < 3; i++) {
      var d = forecastFor(addDays(t, i));
      if (!d) continue;
      var when = i === 0 ? "today" : i === 1 ? "tomorrow" : "in 3 days";
      if (d.tmin !== null && d.tmin <= 0)
        out.push({ k: "freeze", t: "Hard freeze " + when, d: Math.round(d.tmin) + "°C overnight. Anything tender comes indoors - Queen of the Night takes damage below about 5°.", i: i });
      else if (d.tmin !== null && d.tmin <= 4)
        out.push({ k: "frost", t: "Frost risk " + when, d: Math.round(d.tmin) + "°C overnight. Move tender pots in, fleece over the bed.", i: i });
      if (d.tmax !== null && d.tmax >= 38)
        out.push({ k: "heat", t: "Heat stress " + when, d: Math.round(d.tmax) + "°C. Shade cloth up, water before dawn, no repotting or pruning.", i: i });
      if (d.tmax !== null && d.wind !== null && d.tmax >= 32 && d.wind >= 30 && (d.rh === null || d.rh <= 25))
        out.push({ k: "khamsin", t: "Khamsin conditions " + when, d: Math.round(d.tmax) + "°C with " + Math.round(d.wind) + " km/h dry wind. Water deeply tonight and move pots to the lee side - this strips a plant in hours.", i: i });
      if (d.wind !== null && d.wind >= 50)
        out.push({ k: "storm", t: "Strong wind " + when, d: Math.round(d.wind) + " km/h. Tall pots to shelter, stake anything leggy.", i: i });
      if (i === 0 && d.uv !== null && d.uv >= 9)
        out.push({ k: "uv", t: "Very high UV today", d: "Index " + Math.round(d.uv) + ". Shade anything transplanted in the last fortnight.", i: i });
      if (i <= 1 && d.rain >= 5)
        out.push({ k: "rain", t: Math.round(d.rain) + " mm rain " + when, d: "Watering is already skipped for anything outdoors.", i: i });
    }
    // first rains of the season - the autumn sowing signal
    var m = month();
    if (m >= 9 && m <= 11 && S.forecast) {
      for (var j = 0; j < S.forecast.days.length; j++) {
        var dd = S.forecast.days[j];
        if (dd.rain >= 10 && daysBetween(t, dd.date) >= -2 && daysBetween(t, dd.date) <= 3) {
          out.push({ k: "firstrain", t: "First real rain", d: Math.round(dd.rain) + " mm on " + dd.date + ". The autumn sowing window is open - this is the year's best moment to sow winter greens.", i: 0 });
          break;
        }
      }
    }
    var seen = {};
    return out.filter(function (a) { if (seen[a.k]) return false; seen[a.k] = 1; return true; });
  }

  /* ================= bloom watch ================= */
  function bloomWatch() {
    var out = [];
    S.plants.forEach(function (p) {
      if (!p.bud) return;
      var age = daysBetween(p.bud, today());
      var lo = 18 - age, hi = 25 - age;
      if (hi < -3) return;
      out.push({ p: p, age: age, lo: lo, hi: hi,
                 soon: lo <= 2 && hi >= -1, open: lo <= 0 && hi >= 0 });
    });
    return out;
  }

  /* ================= almanac ================= */
  function sowableIn(m) {
    return SP.filter(function (s) { return s.sow.indexOf(m) > -1; });
  }
  function elevShift() {
    // roughly a fortnight per 400 m - highland runs late, the valley runs early
    if (!S.loc || typeof S.loc.elev !== "number") return 0;
    return Math.round(S.loc.elev / 400 * 14);
  }

  window.Bustan = {
    S: S, load: load, save: save, uid: uid,
    today: today, addDays: addDays, daysBetween: daysBetween, month: month,
    SEASONS: SEASONS, season: season,
    stageOf: stageOf, waterStatus: waterStatus, capFor: capFor, kcFor: kcFor,
    runEngine: runEngine, tickDay: tickDay,
    fetchWeather: fetchWeather, forecastFor: forecastFor, staleness: staleness,
    alerts: alerts, bloomWatch: bloomWatch, sowableIn: sowableIn, elevShift: elevShift,
    KEY: KEY
  };
})();
