/* Bustan - screens. Rendering is deliberately dumb: every change writes state,
   saves, and re-renders the whole view. At this size that is faster to reason
   about than any diffing, and the app stays instant. */
(function () {
  "use strict";
  var B = window.Bustan, SP = window.SPECIES, BYID = window.SPECIES_BY_ID, Sprites = window.Sprites;
  var S = B.S, tab = "today", view = document.getElementById("view"),
      dlg = document.getElementById("dlg"), sheet = document.getElementById("sheet");

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined && txt !== null) e.textContent = txt;
    return e;
  }
  function sprite(sp, stage, px) {
    var c = document.createElement("canvas");
    Sprites.toCanvas(c, sp, stage, Math.max(2, Math.round((px || 48) / Sprites.W)));
    return c;
  }
  function name(sp) { return sp.en; }
  function arName(sp) { return S.prefs.arabic && sp.ar ? sp.ar : ""; }
  function openSheet(build) {
    sheet.innerHTML = "";
    build(sheet);
    if (!dlg.open) dlg.showModal();
  }
  function closeSheet() { if (dlg.open) dlg.close(); }
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeSheet(); });

  /* ================= header ================= */
  function paintHeader() {
    var k = B.season(), s = B.SEASONS[k];
    document.documentElement.setAttribute("data-season", k);
    document.getElementById("hSeason").textContent = s.en;
    document.getElementById("hAr").textContent = S.prefs.arabic ? s.ar : "";
    var bits = [], st = B.staleness();
    var d = B.forecastFor(B.today());
    if (d && d.tmax !== null) bits.push(Math.round(d.tmin) + "–" + Math.round(d.tmax) + "°C");
    if (S.loc && S.loc.label) bits.push(S.loc.label);
    if (st === null) bits.push("no forecast yet");
    else if (st > 36) bits.push("forecast " + Math.round(st / 24) + "d old");
    document.getElementById("hSub").textContent = bits.length ? bits.join("  ·  ") : s.note;
  }

  /* ================= TODAY ================= */
  function viewToday(v) {
    var t = B.today();

    // bloom watch first - it is the thing that cannot wait
    B.bloomWatch().forEach(function (b) {
      var sp = BYID[b.p.sid], c = el("div", "bloomcard");
      c.appendChild(el("h3", null, b.p.nick || sp.en));
      if (b.open) {
        c.appendChild(el("div", "count", "TONIGHT"));
        c.appendChild(el("p", "muted", "Day " + b.age + " since you logged the bud. It opens after sunset and is finished by dawn — check from about 9pm."));
      } else if (b.lo > 0) {
        c.appendChild(el("div", "count", b.lo + "–" + b.hi + " days"));
        c.appendChild(el("p", "muted", "Bud logged " + b.age + " day" + (b.age === 1 ? "" : "s") + " ago. Opening usually runs 18–25 days from a visible bud."));
      } else {
        c.appendChild(el("div", "count", "Any night now"));
        c.appendChild(el("p", "muted", "Day " + b.age + ". Past the usual window — check each evening."));
      }
      var row = el("div", "rowflex"); row.style.marginTop = ".5rem";
      var bl = el("button", null, "It bloomed"); bl.onclick = function () { logEvent(b.p, "bloom", "Opened"); b.p.bud = null; render(); };
      var no = el("button", null, "Bud dropped"); no.onclick = function () { b.p.bud = null; B.save(); render(); };
      row.appendChild(bl); row.appendChild(no); c.appendChild(row);
      v.appendChild(c);
    });

    // warnings
    var al = B.alerts();
    if (al.length) {
      v.appendChild(el("div", "sec", "Warnings"));
      al.forEach(function (a) {
        var c = el("div", "alert a-" + a.k);
        c.appendChild(el("h3", null, a.t));
        c.appendChild(el("p", null, a.d));
        v.appendChild(c);
      });
    }

    // forecast strip
    if (S.forecast) {
      v.appendChild(el("div", "sec", "The week"));
      var wx = el("div", "wx");
      for (var i = 0; i < 7; i++) {
        var d = B.forecastFor(B.addDays(t, i));
        if (!d) continue;
        var box = el("div", "wxd" + (i === 0 ? " now" : ""));
        box.appendChild(el("b", null, i === 0 ? "Today" : new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" })));
        box.appendChild(el("div", "t", d.tmax === null ? "–" : Math.round(d.tmax) + "°"));
        box.appendChild(el("div", "tiny", d.tmin === null ? "" : Math.round(d.tmin) + "°"));
        box.appendChild(el("div", "r", d.rain >= 0.5 ? Math.round(d.rain) + "mm" : ""));
        wx.appendChild(box);
      }
      v.appendChild(wx);
    } else {
      var need = el("div", "card");
      need.appendChild(el("h3", "px", "No forecast yet"));
      need.appendChild(el("p", "muted", "Bustan waters by how much water the air actually pulled out of your pots, not by a fixed timer. For that it needs to know where you are."));
      var b1 = el("button", "pri wide", "Set my location");
      b1.style.marginTop = ".5rem";
      b1.onclick = function () { locateSheet(); };
      need.appendChild(b1);
      v.appendChild(need);
    }

    // watering
    if (!S.plants.length) {
      var e = el("div", "empty");
      e.appendChild(sprite(BYID.queenofnight, 4, 76));
      e.appendChild(el("h3", "px", "Nothing planted yet"));
      e.appendChild(el("p", "muted", "Add your Queen of the Night, or anything else you are growing."));
      var ap = el("button", "pri", "Add a plant"); ap.style.marginTop = ".6rem";
      ap.onclick = function () { addPlantSheet(); };
      e.appendChild(ap);
      v.appendChild(e);
      return;
    }

    var due = [], soon = [];
    S.plants.forEach(function (p) {
      var w = B.waterStatus(p);
      (w.due ? due : soon).push({ p: p, w: w });
    });
    v.appendChild(el("div", "sec", due.length ? "Water today (" + due.length + ")" : "Nothing needs water"));
    if (!due.length) v.appendChild(el("p", "muted", S.forecast ? "Everything is holding enough water. The engine already accounted for any rain." : "Set a location and Bustan can work this out from the weather."));
    due.forEach(function (x) { v.appendChild(plantRow(x.p, x.w, true)); });
    if (soon.length) {
      v.appendChild(el("div", "sec", "Holding"));
      soon.forEach(function (x) { v.appendChild(plantRow(x.p, x.w, false)); });
    }
  }

  function plantRow(p, w, showWater) {
    var sp = BYID[p.sid], st = B.stageOf(p);
    var row = el("button", "plant");
    row.appendChild(sprite(sp, st, 52));
    var mid = el("div"); mid.style.flex = "1"; mid.style.minWidth = "0";
    mid.appendChild(el("div", "nm", p.nick || sp.en));
    var bits = [STAGE[st]];
    if (w.why) bits.push(w.why);
    else if (p.lastWater) bits.push("watered " + agoText(p.lastWater));
    mid.appendChild(el("div", "meta", bits.join(" · ")));
    var bar = el("div", "bar"), fill = el("i");
    fill.style.width = Math.round(w.pct * 100) + "%";
    fill.className = w.due ? "due" : w.pct > 0.7 ? "near" : "";
    bar.appendChild(fill); mid.appendChild(bar);
    row.appendChild(mid);
    if (showWater) {
      var wb = el("button", "pri", "Water");
      wb.style.flex = "none";
      wb.onclick = function (ev) { ev.stopPropagation(); doWater(p); };
      row.appendChild(wb);
    }
    row.onclick = function () { plantSheet(p); };
    return row;
  }
  var STAGE = ["Sown", "Seedling", "Young", "Growing", "Mature"];
  function agoText(iso) {
    var n = B.daysBetween(iso, B.today());
    return n === 0 ? "today" : n === 1 ? "yesterday" : n + " days ago";
  }

  /* ================= GARDEN ================= */
  function viewGarden(v) {
    var head = el("div", "spread");
    head.appendChild(el("div", "sec", "Your garden (" + S.plants.length + ")"));
    v.appendChild(head);
    var add = el("button", "pri wide", "+ Add a plant");
    add.onclick = function () { addPlantSheet(); };
    v.appendChild(add);
    if (!S.plants.length) { v.appendChild(el("p", "muted", "Nothing here yet.")); return; }
    var g = el("div", "gardengrid");
    S.plants.forEach(function (p) {
      var sp = BYID[p.sid], w = B.waterStatus(p);
      var t = el("button", "tile" + (w.due ? " due" : ""));
      t.appendChild(sprite(sp, B.stageOf(p), 64));
      t.appendChild(el("div", "nm", p.nick || sp.en));
      if (w.due) t.appendChild(el("div", "dot"));
      t.onclick = function () { plantSheet(p); };
      g.appendChild(t);
    });
    v.appendChild(g);
  }

  /* ================= ALMANAC ================= */
  var almMonth = null;
  function viewAlmanac(v) {
    var m = almMonth || B.month();
    var k = B.season(m), s = B.SEASONS[k];
    var c = el("div", "card");
    c.appendChild(el("h3", "px", s.en + (S.prefs.arabic ? "  " + s.ar : "")));
    c.appendChild(el("p", "muted", s.note));
    var shift = B.elevShift();
    if (shift > 3 && S.loc)
      c.appendChild(el("p", "tiny", "You are at about " + Math.round(S.loc.elev) + " m, so expect things to run roughly " + shift + " days behind the lowland calendar."));
    v.appendChild(c);

    var mo = el("div", "months");
    ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].forEach(function (nm, i) {
      var b = el("button", i + 1 === m ? "on" : "", nm);
      b.onclick = function () { almMonth = i + 1; render(); };
      mo.appendChild(b);
    });
    v.appendChild(mo);

    var list = B.sowableIn(m);
    v.appendChild(el("div", "sec", "Sow in " + ["January","February","March","April","May","June","July","August","September","October","November","December"][m - 1] + " (" + list.length + ")"));
    if (!list.length) v.appendChild(el("p", "muted", "Nothing worth sowing this month. In a Mediterranean summer that is the correct answer, not a gap in the data."));
    var groups = { winter: "Winter vegetables", summer: "Summer vegetables", herb: "Herbs", orn: "Ornamental", tree: "Trees" };
    Object.keys(groups).forEach(function (gk) {
      var sub = list.filter(function (x) { return x.group === gk; });
      if (!sub.length) return;
      v.appendChild(el("div", "tiny", groups[gk].toUpperCase()));
      var st = el("div", "stack");
      sub.forEach(function (sp) { st.appendChild(speciesRow(sp, true)); });
      v.appendChild(st);
    });

    v.appendChild(el("div", "sec", "Everything (" + SP.length + ")"));
    var all = el("div", "stack");
    SP.forEach(function (sp) { all.appendChild(speciesRow(sp, false)); });
    v.appendChild(all);
  }
  function speciesRow(sp, sowable) {
    var r = el("button", "sp");
    r.appendChild(sprite(sp, 4, 44));
    var mid = el("div"); mid.style.flex = "1"; mid.style.minWidth = "0";
    var nm = el("div", "nm", sp.en);
    if (arName(sp)) { var a = el("span", "ar", "  " + sp.ar); nm.appendChild(a); }
    mid.appendChild(nm);
    mid.appendChild(el("div", "meta", (sowable ? "sow now · " : "") + sp.germ + "d to sprout · " +
      (sp.days > 400 ? Math.round(sp.days / 365) + "y to maturity" : sp.days + "d to harvest")));
    r.appendChild(mid);
    r.onclick = function () { speciesSheet(sp); };
    return r;
  }

  /* ================= MORE ================= */
  function viewMore(v) {
    var lv = Math.floor(Math.sqrt(S.xp / 8)) + 1;
    var c = el("div", "card");
    c.appendChild(el("h3", "px", "Gardener level " + lv));
    c.appendChild(el("p", "muted", S.xp + " care actions logged. Every watering, feed, prune and harvest counts."));
    v.appendChild(c);

    var loc = el("div", "card");
    loc.appendChild(el("h3", "px", "Location"));
    loc.appendChild(el("p", "muted", S.loc ? (S.loc.label || (S.loc.lat.toFixed(2) + ", " + S.loc.lon.toFixed(2))) + (typeof S.loc.elev === "number" ? " · " + Math.round(S.loc.elev) + " m" : "") : "Not set. Without it there is no forecast and no watering engine."));
    var lb = el("button", "wide", S.loc ? "Change location" : "Set location");
    lb.style.marginTop = ".5rem"; lb.onclick = locateSheet;
    loc.appendChild(lb);
    if (S.loc) {
      var rb = el("button", "wide", "Refresh forecast");
      rb.style.marginTop = ".4rem";
      rb.onclick = function () {
        rb.textContent = "Fetching…"; rb.disabled = true;
        B.fetchWeather(function (err) {
          rb.disabled = false;
          if (err) { rb.textContent = "Could not reach the weather service"; return; }
          B.runEngine(); B.save(); render();
        });
      };
      loc.appendChild(rb);
      if (S.forecast) loc.appendChild(el("p", "tiny", "Last fetched " + new Date(S.forecast.fetched).toLocaleString()));
    }
    v.appendChild(loc);

    var pr = el("div", "card");
    pr.appendChild(el("h3", "px", "Arabic names"));
    var tg = el("button", "wide", S.prefs.arabic ? "Showing English and Arabic" : "English only");
    tg.onclick = function () { S.prefs.arabic = !S.prefs.arabic; B.save(); render(); };
    pr.appendChild(tg);
    v.appendChild(pr);

    var bk = el("div", "card");
    bk.appendChild(el("h3", "px", "Backup"));
    bk.appendChild(el("p", "muted", "Everything you enter lives in this browser and nowhere else. Copy this out somewhere safe."));
    var ta = el("textarea"); ta.rows = 4; ta.readOnly = true;
    ta.value = JSON.stringify({ v: 1, plants: S.plants, loc: S.loc, xp: S.xp, prefs: S.prefs });
    ta.style.marginTop = ".5rem";
    bk.appendChild(ta);
    var imp = el("button", "wide", "Restore from a backup");
    imp.style.marginTop = ".5rem";
    imp.onclick = function () {
      openSheet(function (s) {
        s.appendChild(el("h3", "px", "Restore"));
        s.appendChild(el("p", "muted", "Paste a backup. This replaces everything currently in the app."));
        var t2 = el("textarea"); t2.rows = 6; t2.style.margin = ".5rem 0";
        s.appendChild(t2);
        var msg = el("p", "muted", "");
        var go = el("button", "pri wide", "Replace everything");
        go.onclick = function () {
          try {
            var d = JSON.parse(t2.value);
            if (!d || !Array.isArray(d.plants)) throw new Error("That does not look like a Bustan backup.");
            var unknown = d.plants.filter(function (p) { return !BYID[p.sid]; });
            if (unknown.length) throw new Error("Backup names " + unknown.length + " plant type" + (unknown.length === 1 ? "" : "s") + " this version does not know.");
            S.plants = d.plants; S.loc = d.loc || S.loc; S.xp = d.xp || 0;
            if (d.prefs) S.prefs = d.prefs;
            S.lastTick = null;
            B.runEngine(); B.save(); closeSheet(); render();
          } catch (e) { msg.textContent = e.message; msg.style.color = "var(--bad)"; }
        };
        s.appendChild(go); s.appendChild(msg);
      });
    };
    bk.appendChild(imp);
    v.appendChild(bk);

    var ab = el("div", "card");
    ab.appendChild(el("h3", "px", "About"));
    ab.appendChild(el("p", "muted", "Bustan waters by evapotranspiration: each day it works out how much water the air actually took from each pot, given your weather, the plant, its pot and how much sun it gets. Rain is subtracted. That is why it goes quiet after a wet night and nags early during a khamsin."));
    ab.appendChild(el("p", "tiny", "Weather from Open-Meteo. Watering follows the FAO-56 crop coefficient method. No account, no server, nothing leaves your phone except the coordinates needed to fetch a forecast."));
    v.appendChild(ab);
  }

  /* ================= sheets ================= */
  function locateSheet() {
    openSheet(function (s) {
      s.appendChild(el("h3", "px", "Where is your garden?"));
      s.appendChild(el("p", "muted", "Used to fetch the forecast and to work out your sowing calendar. It is stored on this device."));
      var msg = el("p", "muted", ""); msg.style.marginTop = ".5rem";
      var gps = el("button", "pri wide", "Use my location");
      gps.style.marginTop = ".6rem";
      gps.onclick = function () {
        if (!navigator.geolocation) { msg.textContent = "This browser has no location support. Enter coordinates below instead."; return; }
        msg.textContent = "Asking the phone…";
        navigator.geolocation.getCurrentPosition(function (pos) {
          S.loc = { lat: pos.coords.latitude, lon: pos.coords.longitude, label: null };
          msg.textContent = "Got it. Fetching the forecast…";
          B.fetchWeather(function (err) {
            if (err) { msg.textContent = "Location saved, but the weather service could not be reached. It will retry next time you open the app."; B.save(); return; }
            S.lastTick = null; B.runEngine(); B.save(); closeSheet(); render();
          });
        }, function (e) {
          msg.textContent = e.code === 1 ? "Permission refused. Enter coordinates below instead." : "Could not get a fix. Enter coordinates below instead.";
        }, { timeout: 12000, maximumAge: 600000 });
      };
      s.appendChild(gps);

      var f1 = el("div", "field"); f1.style.marginTop = ".8rem";
      f1.appendChild(el("label", null, "Or type coordinates"));
      var g2 = el("div", "grid2");
      var la = el("input"); la.placeholder = "latitude, e.g. 31.95"; la.inputMode = "decimal";
      var lo = el("input"); lo.placeholder = "longitude, e.g. 35.93"; lo.inputMode = "decimal";
      if (S.loc) { la.value = S.loc.lat; lo.value = S.loc.lon; }
      g2.appendChild(la); g2.appendChild(lo);
      f1.appendChild(g2); s.appendChild(f1);
      var nmf = el("div", "field");
      nmf.appendChild(el("label", null, "Name it (optional)"));
      var nmi = el("input"); nmi.placeholder = "Amman, the balcony, …";
      if (S.loc && S.loc.label) nmi.value = S.loc.label;
      nmf.appendChild(nmi); s.appendChild(nmf);

      var ok = el("button", "wide", "Save");
      ok.onclick = function () {
        var a = parseFloat(la.value), b = parseFloat(lo.value);
        if (isNaN(a) || isNaN(b) || a < -90 || a > 90 || b < -180 || b > 180) {
          msg.textContent = "Those coordinates are not valid. Latitude is −90 to 90, longitude −180 to 180."; return;
        }
        S.loc = { lat: a, lon: b, label: nmi.value.trim() || null };
        msg.textContent = "Fetching the forecast…";
        B.fetchWeather(function (err) {
          if (err) { msg.textContent = "Saved, but the weather service could not be reached right now."; B.save(); return; }
          S.lastTick = null; B.runEngine(); B.save(); closeSheet(); render();
        });
      };
      s.appendChild(ok); s.appendChild(msg);
      var cl = el("button", "wide", "Cancel"); cl.style.marginTop = ".4rem"; cl.onclick = closeSheet;
      s.appendChild(cl);
    });
  }

  function addPlantSheet() {
    var m = B.month(), filter = "now", chosen = null;
    openSheet(function (s) {
      s.appendChild(el("h3", "px", "Add a plant"));
      var chips = el("div", "chips"); chips.style.margin = ".5rem 0";
      [["now", "Sow now"], ["all", "Everything"], ["herb", "Herbs"], ["winter", "Winter veg"], ["summer", "Summer veg"], ["orn", "Ornamental"], ["tree", "Trees"]]
        .forEach(function (f) {
          var c = el("button", "chip" + (filter === f[0] ? " on" : ""), f[1]);
          c.onclick = function () { filter = f[0]; closeSheet(); addPlantSheetWith(filter); };
          chips.appendChild(c);
        });
      s.appendChild(chips);
      var list = filter === "now" ? B.sowableIn(m) : SP;
      if (!list.length) s.appendChild(el("p", "muted", "Nothing is normally sown this month. Tap Everything to add something anyway."));
      var st = el("div", "stack");
      list.forEach(function (sp) {
        var r = el("button", "sp");
        r.appendChild(sprite(sp, 4, 44));
        var mid = el("div"); mid.style.flex = "1";
        var nm = el("div", "nm", sp.en);
        if (arName(sp)) nm.appendChild(el("span", "ar", "  " + sp.ar));
        mid.appendChild(nm);
        mid.appendChild(el("div", "meta", sp.sun === "full" ? "full sun" : sp.sun === "part" ? "part shade" : sp.sun === "shade" ? "shade" : "indoors"));
        r.appendChild(mid);
        r.onclick = function () { closeSheet(); configPlantSheet(sp); };
        st.appendChild(r);
      });
      s.appendChild(st);
      var cl = el("button", "wide", "Cancel"); cl.style.marginTop = ".6rem"; cl.onclick = closeSheet;
      s.appendChild(cl);
    });
  }
  function addPlantSheetWith(f) {
    var list = f === "now" ? B.sowableIn(B.month()) : f === "all" ? SP : SP.filter(function (x) { return x.group === f; });
    openSheet(function (s) {
      s.appendChild(el("h3", "px", "Add a plant"));
      var chips = el("div", "chips"); chips.style.margin = ".5rem 0";
      [["now", "Sow now"], ["all", "Everything"], ["herb", "Herbs"], ["winter", "Winter veg"], ["summer", "Summer veg"], ["orn", "Ornamental"], ["tree", "Trees"]]
        .forEach(function (x) {
          var c = el("button", "chip" + (f === x[0] ? " on" : ""), x[1]);
          c.onclick = function () { closeSheet(); addPlantSheetWith(x[0]); };
          chips.appendChild(c);
        });
      s.appendChild(chips);
      if (!list.length) s.appendChild(el("p", "muted", "Nothing here for this month."));
      var st = el("div", "stack");
      list.forEach(function (sp) {
        var r = el("button", "sp");
        r.appendChild(sprite(sp, 4, 44));
        var mid = el("div"); mid.style.flex = "1";
        var nm = el("div", "nm", sp.en);
        if (arName(sp)) nm.appendChild(el("span", "ar", "  " + sp.ar));
        mid.appendChild(nm); r.appendChild(mid);
        r.onclick = function () { closeSheet(); configPlantSheet(sp); };
        st.appendChild(r);
      });
      s.appendChild(st);
      var cl = el("button", "wide", "Cancel"); cl.style.marginTop = ".6rem"; cl.onclick = closeSheet;
      s.appendChild(cl);
    });
  }
  function configPlantSheet(sp) {
    openSheet(function (s) {
      var hero = el("div", "hero");
      hero.appendChild(sprite(sp, 4, 110));
      var ht = el("div");
      ht.appendChild(el("h3", "px", sp.en));
      if (arName(sp)) ht.appendChild(el("div", "muted", sp.ar));
      ht.appendChild(el("div", "tiny", sp.germ + " days to sprout · " + (sp.days > 400 ? Math.round(sp.days / 365) + " years to maturity" : sp.days + " days to harvest")));
      hero.appendChild(ht);
      s.appendChild(hero);

      var f = el("div", "field"); f.style.marginTop = ".8rem";
      f.appendChild(el("label", null, "Call it"));
      var nick = el("input"); nick.placeholder = sp.en; f.appendChild(nick); s.appendChild(f);

      function pick(labelText, opts, def) {
        var fd = el("div", "field");
        fd.appendChild(el("label", null, labelText));
        var sel = el("select");
        opts.forEach(function (o) { var op = el("option", null, o[1]); op.value = o[0]; sel.appendChild(op); });
        sel.value = def;
        fd.appendChild(sel); s.appendChild(fd);
        return sel;
      }
      var size = pick("Pot size", [["small", "Small — up to 2 litres"], ["medium", "Medium — 5 to 10 litres"], ["large", "Large — 20 litres or more"], ["ground", "In the ground"]], "medium");
      var mat = pick("Container", [["terracotta", "Terracotta — dries fast"], ["plastic", "Plastic or glazed"], ["selfwater", "Self-watering"], ["ground", "In the ground"]], "plastic");
      var sun = pick("Sun", [["full", "Full sun"], ["part", "Half day sun"], ["shade", "Bright shade"], ["indoor", "Indoors"]], sp.sun);
      var whenF = el("div", "field");
      whenF.appendChild(el("label", null, "Sown or bought on"));
      var when = el("input"); when.type = "date"; when.value = B.today();
      whenF.appendChild(when); s.appendChild(whenF);

      var add = el("button", "pri wide", "Add to my garden");
      add.onclick = function () {
        var d = when.value || B.today();
        if (B.daysBetween(d, B.today()) < 0) { alertLine(s, "That date is in the future."); return; }
        S.plants.push({
          id: B.uid(), sid: sp.id, nick: nick.value.trim() || null,
          size: size.value, mat: mat.value, sun: sun.value,
          sown: d, def: 0, lastWater: null, events: [], bud: null
        });
        S.lastTick = null; B.runEngine(); B.save(); closeSheet(); tab = "garden"; render();
      };
      s.appendChild(add);
      var cl = el("button", "wide", "Back"); cl.style.marginTop = ".4rem";
      cl.onclick = function () { closeSheet(); addPlantSheet(); };
      s.appendChild(cl);
    });
  }
  function alertLine(s, txt) {
    var p = el("p", "muted", txt); p.style.color = "var(--bad)"; s.appendChild(p);
  }

  function speciesSheet(sp) {
    openSheet(function (s) {
      var hero = el("div", "hero");
      hero.appendChild(sprite(sp, 4, 110));
      var ht = el("div");
      ht.appendChild(el("h3", "px", sp.en));
      if (arName(sp)) ht.appendChild(el("div", "muted", sp.ar));
      hero.appendChild(ht);
      s.appendChild(hero);
      var strip = el("div", "rowflex"); strip.style.margin = ".7rem 0";
      for (var i = 0; i < 5; i++) { var c = sprite(sp, i, 40); c.style.width = "40px"; c.style.height = "40px"; c.style.background = "var(--sunk)"; strip.appendChild(c); }
      s.appendChild(strip);
      var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      s.appendChild(el("div", "tiny", "SOW"));
      var ch = el("div", "chips");
      for (var m = 1; m <= 12; m++) ch.appendChild(el("span", "chip" + (sp.sow.indexOf(m) > -1 ? " on" : ""), months[m - 1]));
      s.appendChild(ch);
      var facts = el("p", "muted");
      facts.style.marginTop = ".6rem";
      facts.textContent = sp.germ + " days to sprout · " +
        (sp.days > 400 ? Math.round(sp.days / 365) + " years to maturity" : sp.days + " days to harvest") + " · " +
        (sp.sun === "full" ? "full sun" : sp.sun === "part" ? "part shade" : sp.sun === "shade" ? "shade" : "indoors") + " · " +
        (sp.w === "dry" ? "let it dry between waterings" : "steady moisture");
      s.appendChild(facts);
      if (sp.tips && sp.tips.length) {
        s.appendChild(el("div", "tiny", "WORTH KNOWING"));
        var ul = el("ul", "tips");
        sp.tips.forEach(function (t) { ul.appendChild(el("li", null, t)); });
        s.appendChild(ul);
      }
      var add = el("button", "pri wide", "Add this to my garden");
      add.style.marginTop = ".6rem";
      add.onclick = function () { closeSheet(); configPlantSheet(sp); };
      s.appendChild(add);
      var cl = el("button", "wide", "Close"); cl.style.marginTop = ".4rem"; cl.onclick = closeSheet;
      s.appendChild(cl);
    });
  }

  function plantSheet(p) {
    var sp = BYID[p.sid];
    openSheet(function (s) {
      var st = B.stageOf(p), w = B.waterStatus(p);
      var hero = el("div", "hero");
      hero.appendChild(sprite(sp, st, 110));
      var ht = el("div"); ht.style.minWidth = "0";
      ht.appendChild(el("h3", "px", p.nick || sp.en));
      ht.appendChild(el("div", "muted", sp.en + (arName(sp) ? "  " + sp.ar : "")));
      ht.appendChild(el("div", "tiny", STAGE[st] + " · sown " + agoText(p.sown)));
      var bar = el("div", "bar"), fill = el("i");
      fill.style.width = Math.round(w.pct * 100) + "%";
      fill.className = w.due ? "due" : w.pct > 0.7 ? "near" : "";
      bar.appendChild(fill); ht.appendChild(bar);
      ht.appendChild(el("div", "tiny", w.due ? "Needs water" : w.why ? w.why : "Holding " + Math.round((1 - w.pct) * 100) + "%"));
      hero.appendChild(ht);
      s.appendChild(hero);

      var acts = el("div", "acts"); acts.style.margin = ".8rem 0";
      function act(label, kind, cls) {
        var b = el("button", cls || "", label);
        b.onclick = function () { logEvent(p, kind, label); closeSheet(); render(); };
        acts.appendChild(b);
      }
      act("Water", "water", "pri");
      act("Feed", "feed");
      act("Prune", "prune");
      act("Harvest", "harvest");
      act("Pest seen", "pest");
      if (sp.arch === "pad" || sp.group === "orn") {
        var bb = el("button", null, p.bud ? "Bud logged" : "Bud spotted");
        bb.disabled = !!p.bud;
        bb.onclick = function () { p.bud = B.today(); logEvent(p, "bud", "Bud spotted"); closeSheet(); render(); };
        acts.appendChild(bb);
      }
      s.appendChild(acts);

      if (sp.tips && sp.tips.length) {
        s.appendChild(el("div", "tiny", "WORTH KNOWING"));
        var ul = el("ul", "tips");
        sp.tips.forEach(function (t) { ul.appendChild(el("li", null, t)); });
        s.appendChild(ul);
      }

      var ev = (p.events || []).slice().reverse();
      s.appendChild(el("div", "tiny", "HISTORY (" + ev.length + ")"));
      if (!ev.length) s.appendChild(el("p", "muted", "Nothing logged yet."));
      ev.slice(0, 30).forEach(function (e) {
        var r = el("div", "log");
        r.appendChild(el("span", "w", agoText(e.d)));
        r.appendChild(el("span", null, e.t));
        s.appendChild(r);
      });

      var rm = el("button", "wide", "Remove this plant");
      rm.style.marginTop = ".8rem";
      rm.onclick = function () {
        rm.textContent = "Tap again to remove for good";
        rm.onclick = function () {
          S.plants = S.plants.filter(function (x) { return x.id !== p.id; });
          B.save(); closeSheet(); render();
        };
      };
      s.appendChild(rm);
      var cl = el("button", "wide", "Close"); cl.style.marginTop = ".4rem"; cl.onclick = closeSheet;
      s.appendChild(cl);
    });
  }

  function logEvent(p, kind, label) {
    p.events = p.events || [];
    p.events.push({ d: B.today(), k: kind, t: label });
    if (p.events.length > 400) p.events = p.events.slice(-400);
    if (kind === "water") { p.def = 0; p.lastWater = B.today(); }
    S.xp = (S.xp || 0) + 1;
    B.save();
  }
  function doWater(p) { logEvent(p, "water", "Watered"); render(); }

  /* ================= render ================= */
  function render() {
    paintHeader();
    view.innerHTML = "";
    view.scrollTop = 0;
    if (tab === "today") viewToday(view);
    else if (tab === "garden") viewGarden(view);
    else if (tab === "almanac") viewAlmanac(view);
    else viewMore(view);
    Array.prototype.forEach.call(document.querySelectorAll("nav button"), function (b) {
      b.className = b.dataset.tab === tab ? "on" : "";
    });
  }

  // little pixel glyphs on the nav, drawn the same way as everything else
  function navIcons() {
    var specs = [
      { arch: "bush", art: { leaf: "#7fc257", dark: "#3a6b3a", light: "#c9e89a", stem: "#3a6b3a", pot: "#a85f37", potDark: "#6d4028" } },
      { arch: "rosette", art: { leaf: "#7fc257", dark: "#3a6b3a", light: "#c9e89a", stem: "#3a6b3a", pot: "#a85f37", potDark: "#6d4028" } },
      { arch: "needle", art: { leaf: "#e0a93f", dark: "#8a6a2a", light: "#f0d68a", stem: "#8a6a2a", pot: "#a85f37", potDark: "#6d4028" } },
      { arch: "succulent", art: { leaf: "#6fa8d6", dark: "#3f6280", light: "#b8d8ee", stem: "#3f6280", pot: "#a85f37", potDark: "#6d4028" } }
    ];
    Array.prototype.forEach.call(document.querySelectorAll("nav .ic"), function (cv, i) {
      Sprites.toCanvas(cv, specs[i], 4, 1);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("nav button"), function (b) {
    b.onclick = function () { tab = b.dataset.tab; render(); };
  });

  /* ================= boot ================= */
  B.load();
  B.runEngine();
  navIcons();
  render();

  // refresh the forecast at most every 3 hours, and never block the UI on it
  if (S.loc) {
    var st = B.staleness();
    if (st === null || st > 3) {
      B.fetchWeather(function (err) {
        if (err) return;
        B.runEngine(); B.save(); render();
      });
    }
  }

  // Register immediately, NOT on window.load. This app is the only one here
  // that pulls a webfont, and window.load waits on it: on a network where
  // fonts.googleapis.com is slow or filtered, load fires late or not at all,
  // the worker never registers, and Chrome offers "Add to Home screen" (a
  // bookmark) instead of "Install app". Registration is async anyway, so
  // there is nothing to gain by waiting.
  if ("serviceWorker" in navigator &&
      (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("./sw.js").catch(function () {});
  }
})();
