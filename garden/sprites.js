/* Bustan sprite engine.

   Every plant is drawn, not stored. A species names an archetype and a palette;
   the archetype puts pixels on a 20x20 grid and the palette colours them. Fifty
   species cost about what one photograph would, and nothing is ever fetched.

   Stages 0 and 1 are shared: a seed is a seed, and seedlings genuinely do all
   look alike. Stages 2-4 are where a species starts looking like itself. */
(function (root) {
  var W = 20, H = 20;
  var SOIL = 15;   // first row of the pot; everything grows up from SOIL - 1
  var CX = 9;      // centre column - the pot is drawn symmetric about it

  function grid() {
    var g = new Array(H), y, x;
    for (y = 0; y < H; y++) { g[y] = new Array(W); for (x = 0; x < W; x++) g[y][x] = null; }
    return g;
  }
  function set(g, x, y, c) {
    x = Math.round(x); y = Math.round(y);
    // NaN fails every comparison, so it would slip past a plain range check and
    // then blow up on g[NaN][x]. Test for a real integer first.
    if (!(x >= 0 && x < W && y >= 0 && y < H) || !c) return;
    g[y][x] = c;
  }
  function clear(g, x, y) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    g[y][x] = null;
  }
  function hline(g, x0, x1, y, c) { for (var x = x0; x <= x1; x++) set(g, x, y, c); }
  function vline(g, x, y0, y1, c) { for (var y = y0; y <= y1; y++) set(g, x, y, c); }
  function blob(g, cx, cy, rx, ry, c) {
    for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++)
      if ((x * x) / (rx * rx + 0.001) + (y * y) / (ry * ry + 0.001) <= 1.05) set(g, cx + x, cy + y, c);
  }
  function inBlob(x, y, cx, cy, rx, ry) {
    var dx = x - cx, dy = y - cy;
    return (dx * dx) / (rx * rx + 0.001) + (dy * dy) / (ry * ry + 0.001) <= 1.05;
  }
  // a tapering leaf: fat at the base, one pixel at the tip
  function wedge(g, x0, y0, dx, dy, len, wBase, cMid, cEdge) {
    for (var s = 0; s <= len; s++) {
      var w = Math.max(0, Math.round(wBase * (1 - s / (len + 0.5))));
      var x = x0 + dx * s, y = y0 + dy * s;
      for (var o = -w; o <= w; o++) set(g, x + o * (Math.abs(dy) > Math.abs(dx) ? 1 : 0),
                                          y + o * (Math.abs(dy) > Math.abs(dx) ? 0 : 1),
                                          o === 0 ? cMid : cEdge);
    }
  }
  function rnd(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }

  /* ---------- containers ---------- */
  function pot(g, kind, P) {
    var body = P.pot || "#a85f37", rim = P.potDark || "#6d4028",
        lit = P.potLight || "#c07a4e", earth = "#3a2c1d";
    if (kind === "ground") {
      hline(g, 0, W - 1, SOIL - 1, "#4a3a26");
      for (var x = 0; x < W; x++) for (var y = SOIL; y < H; y++) set(g, x, y, y < SOIL + 2 ? earth : "#2e2417");
      return;
    }
    hline(g, 5, 13, SOIL - 1, earth);   // soil surface, sunk inside the rim
    hline(g, 4, 14, SOIL, rim);         // rim is the widest line
    hline(g, 4, 14, SOIL + 1, body);
    hline(g, 5, 13, SOIL + 2, body);
    hline(g, 5, 13, SOIL + 3, body);
    hline(g, 6, 12, SOIL + 4, rim);     // base
    vline(g, 6, SOIL + 1, SOIL + 2, lit);   // lit side
    vline(g, 12, SOIL + 1, SOIL + 3, rim);  // shaded side
  }
  // keep a shape from spilling outside the pot interior
  function potMask(g, y0) {
    for (var y = y0; y < H; y++) for (var x = 0; x < W; x++) {
      var lo = y <= SOIL + 1 ? 5 : 6, hi = y <= SOIL + 1 ? 13 : 12;
      if (x < lo || x > hi) continue;
    }
  }

  /* ---------- shared early stages ---------- */
  function seed(g, P) {
    set(g, CX, SOIL - 2, "#7a5c34"); set(g, CX + 1, SOIL - 2, "#7a5c34");
    set(g, CX, SOIL - 3, "#8d6c40");
  }
  function sprout(g, P) {
    var s = P.stem || P.dark;
    vline(g, CX, SOIL - 4, SOIL - 2, s);
    hline(g, CX - 2, CX - 1, SOIL - 5, P.light); set(g, CX - 2, SOIL - 4, P.leaf);
    hline(g, CX + 1, CX + 2, SOIL - 5, P.light); set(g, CX + 2, SOIL - 4, P.leaf);
    set(g, CX, SOIL - 5, P.leaf);
  }

  /* ---------- archetypes: (grid, palette, t) where t = 0|1|2 for stages 2,3,4 ---------- */
  var ARCH = {};

  // Lettuce, cabbage, cauliflower - a low bowl of concentric leaves
  ARCH.rosette = function (g, P, t) {
    var r = [4, 6, 8][t], h = [2, 3, 4][t], base = SOIL - 2, i;
    for (i = r; i >= 1; i--) {
      var c = i % 2 ? P.leaf : P.dark;
      blob(g, CX, base - Math.round(h * (r - i) / r), i, Math.max(1, Math.round(i * 0.6)), c);
    }
    blob(g, CX, base - h, Math.max(1, r - 4), Math.max(1, r - 5), P.light);
    if (t === 2 && P.accent) blob(g, CX, base - h - 1, 2, 2, P.accent);
  };

  // Chard, spinach, leek - upright straps fanning from a crown
  ARCH.strap = function (g, P, t) {
    var n = [3, 5, 7][t], top = [7, 4, 1][t], i;
    for (i = 0; i < n; i++) {
      var lean = Math.round((i - (n - 1) / 2) * 1.5);
      var x = CX + lean, ty = top + Math.abs(lean);
      wedge(g, x, SOIL - 2, 0, -1, SOIL - 2 - ty, 1, i % 2 ? P.leaf : P.dark, P.dark);
      set(g, x, ty, P.light);
      if (P.stem) { set(g, x, SOIL - 2, P.stem); set(g, x, SOIL - 3, P.stem); }
    }
  };

  // Basil, mint, oregano - a dense rounded mass on a short stem
  ARCH.bush = function (g, P, t) {
    var rx = [4, 6, 7][t], ry = [3, 4, 5][t], cy = SOIL - 3 - ry;
    vline(g, CX, cy, SOIL - 2, P.stem || P.dark);
    blob(g, CX, cy, rx, ry, P.dark);
    blob(g, CX, cy, rx - 1, ry - 1, P.leaf);
    blob(g, CX - 1, cy - 1, Math.max(1, rx - 3), Math.max(1, ry - 3), P.light);
    if (t === 2 && P.accent) {
      set(g, CX, cy - ry - 1, P.accent); set(g, CX - 3, cy - ry + 1, P.accent);
      set(g, CX + 3, cy - ry + 1, P.accent);
    }
  };

  // Rosemary, thyme, dill - fine upright stems with tick leaves
  ARCH.needle = function (g, P, t) {
    var n = [3, 5, 7][t], top = [8, 5, 2][t], R = rnd(7), i, y;
    for (i = 0; i < n; i++) {
      var x = CX - 4 + Math.round(i * 8 / Math.max(1, n - 1));
      var ty = top + Math.round(R() * 2) + Math.abs(x - CX);
      vline(g, x, ty, SOIL - 2, P.dark);
      for (y = ty; y < SOIL - 2; y += 2) {
        set(g, x - 1, y, P.leaf); set(g, x + 1, y + 1, i % 2 ? P.light : P.leaf);
      }
      set(g, x, ty - 1, P.light);
    }
    if (t === 2 && P.accent) { set(g, CX - 4, top, P.accent); set(g, CX + 4, top + 1, P.accent); set(g, CX, top - 1, P.accent); }
  };

  // Tomato, pepper, aubergine - staked stem, side leaves, hanging fruit
  ARCH.fruitvine = function (g, P, t) {
    var top = [9, 5, 1][t], i;
    vline(g, CX, top, SOIL - 2, P.stem || P.dark);
    vline(g, CX + 1, top + 1, SOIL - 2, P.dark);
    for (i = top + 1; i < SOIL - 2; i += 2) {
      var w = 3 + ((i % 4 === 0) ? 1 : 0), side = (i % 4 === 0) ? -1 : 1;
      if (side < 0) { hline(g, CX - w, CX - 1, i, P.leaf); set(g, CX - w, i - 1, P.light); set(g, CX - w + 1, i + 1, P.dark); }
      else { hline(g, CX + 2, CX + w + 1, i, P.dark); set(g, CX + w + 1, i - 1, P.leaf); }
    }
    if (t >= 1 && P.accent) {
      var fr = P.fruitR || 1;
      blob(g, CX - 3, SOIL - 5, fr, fr, t === 2 ? P.accent : P.leaf);
      set(g, CX - 3, SOIL - 5 - fr - 1, P.dark);
      if (t === 2) {
        blob(g, CX + 4, SOIL - 8, fr, fr, P.accent);
        set(g, CX + 4, SOIL - 8 - fr - 1, P.dark);
      }
    }
  };

  // Cucumber, courgette, melon - broad lobed leaves sprawling wide
  ARCH.cucurbit = function (g, P, t) {
    var rx = [5, 7, 9][t], ry = [3, 4, 4][t], cy = SOIL - 4 - ry, i;
    vline(g, CX, cy, SOIL - 2, P.stem || P.dark);
    for (i = -1; i <= 1; i += 2) {
      var lx = CX + i * Math.round(rx * 0.55);
      blob(g, lx, cy + 2, Math.round(rx * 0.5), ry, P.dark);
      blob(g, lx, cy + 2, Math.round(rx * 0.38), ry - 1, P.leaf);
      clear(g, lx + i * Math.round(rx * 0.5), cy + 2);   // a lobe notch
    }
    blob(g, CX, cy - 1, Math.round(rx * 0.42), ry, P.leaf);
    blob(g, CX, cy - 1, Math.round(rx * 0.28), ry - 2, P.light);
    if (t === 2 && P.accent) {
      var fr = P.fruitR || 2;
      blob(g, CX + 5, SOIL - 3, fr, Math.max(1, fr - 1), P.accent);
      set(g, CX + 5 - fr, SOIL - 3 - 1, P.dark);
    }
  };

  // Carrot, radish, beet - tops above the line, the root swelling below it
  ARCH.root = function (g, P, t) {
    var n = [3, 5, 7][t], top = [9, 6, 3][t], i;
    for (i = 0; i < n; i++) {
      var lean = Math.round((i - (n - 1) / 2) * 1.4);
      var x = CX + lean, ty = top + Math.abs(lean);
      vline(g, x, ty, SOIL - 2, i % 2 ? P.leaf : P.dark);
      set(g, x + (lean > 0 ? 1 : -1), ty + 1, P.light);
      set(g, x, ty, P.light);
    }
    if (P.accent) {
      // only the shoulder shows; the rest is implied under the soil
      var d = [1, 2, 3][t];
      for (var y = SOIL - 1; y <= SOIL + 1 && y < H; y++) {
        var w = Math.max(0, d - (y - (SOIL - 1)));
        for (var x = CX - w; x <= CX + w; x++) {
          if (x < 5 || x > 13) continue;                       // stay inside the pot
          set(g, x, y, x === CX - w ? P.accent : P.accent);
        }
      }
      set(g, CX, SOIL - 1, P.light);
    }
  };

  // Onion, garlic, chives - hollow tubes from a swollen base
  ARCH.bulb = function (g, P, t) {
    var n = [3, 5, 6][t], top = [9, 5, 2][t], i;
    for (i = 0; i < n; i++) {
      var lean = Math.round((i - (n - 1) / 2) * 1.7);
      var x = CX + lean, ty = top + Math.abs(lean) * 2;
      vline(g, x, ty, SOIL - 3, i % 2 ? P.leaf : P.dark);
      set(g, x, ty, P.light);
    }
    var r = [1, 2, 3][t];
    blob(g, CX, SOIL - 2, r, Math.max(1, r - 1), P.accent || P.light);
    set(g, CX - r, SOIL - 2, P.dark);
  };

  // Sweetcorn, okra, molokhia - one thick stalk, long alternating leaves
  ARCH.cane = function (g, P, t) {
    var top = [8, 4, 0][t], i, side = 1;
    vline(g, CX, top, SOIL - 2, P.stem || P.dark);
    vline(g, CX + 1, top + 1, SOIL - 2, P.leaf);
    for (i = top + 2; i < SOIL - 2; i += 3) {
      var len = 5 + (i % 2);
      for (var s = 1; s <= len; s++) {
        var x = side > 0 ? CX + 1 + s : CX - s;
        var y = i + Math.round(s * s / 9);           // the leaf arches over
        set(g, x, y, s > len - 2 ? P.light : (side > 0 ? P.leaf : P.dark));
        if (s < len - 1) set(g, x, y - 1, side > 0 ? P.dark : P.leaf);
      }
      side = -side;
    }
    if (t === 2 && P.accent) { vline(g, CX, top - 1, top + 1, P.accent); blob(g, CX + 2, top + 4, 1, 2, P.accent); }
  };

  // Peas, beans, grapevine - thin climbing stem with tendrils and pods
  ARCH.climber = function (g, P, t) {
    var top = [9, 5, 1][t], i;
    for (i = top; i < SOIL - 2; i++) {
      var x = CX + Math.round(Math.sin(i * 0.8) * 2);
      set(g, x, i, P.dark); set(g, x + 1, i, P.stem || P.leaf);
      if (i % 3 === 0) { hline(g, x - 3, x - 1, i, P.leaf); set(g, x - 3, i - 1, P.light); set(g, x - 2, i + 1, P.dark); }
      if (i % 3 === 1) { hline(g, x + 2, x + 4, i, P.dark); set(g, x + 4, i - 1, P.leaf); }
    }
    if (t === 2 && P.accent) {
      vline(g, CX + 4, SOIL - 7, SOIL - 4, P.accent); set(g, CX + 4, SOIL - 8, P.dark);
      vline(g, CX - 4, SOIL - 6, SOIL - 4, P.accent); set(g, CX - 4, SOIL - 7, P.dark);
    }
  };

  // Queen of the Night - flat scalloped pads, and the one bloom that matters.
  // The flower is hand-drawn rather than generated: it opens one night a year
  // and it is the reason this app exists, so it gets to be the best thing on
  // the screen. Everything else here is procedural.
  var BLOOM = [
    ".....p.....",
    "..p..p..p..",
    "...ppppp...",
    "...pwwwp...",
    ".ppwwwwwpp.",
    ".pwwwYwwwp.",
    ".ppwwwwwpp.",
    "...pwwwp...",
    "...ppppp...",
    "..p..p..p..",
    ".....p....."
  ];
  ARCH.pad = function (g, P, t) {
    var n = [1, 2, 3][t], i, y;
    // pads: wide flat blades with a lit midrib and a notched, scalloped edge
    for (i = 0; i < n; i++) {
      var lean = (i - (n - 1) / 2) * 4;
      var bx = CX - 4 + Math.round(lean);
      var bt = [6, 4, 3][t] + Math.abs(Math.round(lean / 2));
      for (y = bt; y < SOIL - 1; y++) {
        var tip = (y === bt);
        var notch = !tip && y < SOIL - 3 && (y - bt) % 3 === 2;
        var w = tip ? 1 : notch ? 1 : 2;
        hline(g, bx - w, bx + w, y, P.leaf);
        set(g, bx - w, y, P.dark);
        set(g, bx + w, y, P.dark);
        set(g, bx, y, P.light);
      }
      set(g, bx, bt - 1, P.dark);
    }
    if (t === 2 && P.accent) {
      var fx = CX + 5, fy = 5;                 // centre of the bloom
      var col = { p: P.accent, P: P.accent2 || "#b8547a",
                  w: P.light2 || "#f2e9d6", Y: P.accent2 || "#e8c35a" };
      // stalk first, so the flower head sits on top of it
      for (y = fy + 5; y < SOIL - 2; y++) set(g, fx - (y - fy - 5), y, P.dark);
      for (y = 0; y < BLOOM.length; y++) {
        for (var x = 0; x < BLOOM[y].length; x++) {
          var ch = BLOOM[y].charAt(x);
          if (ch === ".") continue;
          set(g, fx - 5 + x, fy - 5 + y, col[ch]);
        }
      }
    }
  };

  // Aloe, echeveria, jade - a fleshy upright rosette
  ARCH.succulent = function (g, P, t) {
    var n = [5, 7, 9][t], len = [4, 6, 7][t], i;
    for (i = 0; i < n; i++) {
      var a = -Math.PI * 0.94 + (i + 0.5) * (Math.PI * 0.88) / n;
      var dx = Math.cos(a), dy = Math.sin(a) * 0.8;
      var mid = i % 2 ? P.leaf : P.dark;
      for (var s = 0; s <= len; s++) {
        var w = s < len - 2 ? 1 : 0;
        var x = CX + dx * s, y = SOIL - 2 + dy * s;
        set(g, x, y, s > len - 2 ? P.light : mid);
        if (w) { set(g, x, y - 1, mid); set(g, x + (dx > 0 ? 1 : -1), y, P.dark); }
      }
    }
    blob(g, CX, SOIL - 3, 1, 1, P.light);
    if (t === 2 && P.accent) { vline(g, CX, 2, SOIL - 8, P.dark); blob(g, CX, 2, 1, 1, P.accent); }
  };

  // Lemon, olive, fig, pomegranate - trunk and canopy
  ARCH.tree = function (g, P, t) {
    var rx = [4, 5, 6][t], ry = [3, 4, 5][t], cy = SOIL - 4 - ry;
    var tr = P.stem || "#6b4a2c";
    vline(g, CX, cy + ry - 1, SOIL - 2, tr); vline(g, CX + 1, cy + ry - 1, SOIL - 2, tr);
    if (t > 0) { set(g, CX - 1, cy + ry, tr); set(g, CX + 2, cy + ry + 1, tr); }
    blob(g, CX, cy, rx, ry, P.dark);
    blob(g, CX, cy, rx - 1, ry - 1, P.leaf);
    blob(g, CX - 1, cy - 1, Math.max(1, rx - 3), Math.max(1, ry - 3), P.light);
    if (t === 2 && P.accent) {
      var pts = [[-2, 1], [2, -1], [0, 2], [3, 1], [-3, -1]], k;
      for (k = 0; k < pts.length; k++) {
        var fx = CX + pts[k][0], fy = cy + pts[k][1];
        if (!inBlob(fx, fy, CX, cy, rx, ry)) continue;      // never outside the canopy
        set(g, fx, fy, P.accent);
        if ((P.fruitR || 1) > 1 && inBlob(fx, fy + 1, CX, cy, rx, ry)) set(g, fx, fy + 1, P.accent);
      }
    }
  };

  // Pothos, monstera, sweet potato - trailing heart leaves over the rim
  ARCH.trailing = function (g, P, t) {
    var n = [3, 5, 7][t], R = rnd(19), i;
    vline(g, CX, SOIL - 6, SOIL - 2, P.stem || P.dark);
    for (i = 0; i < n; i++) {
      var side = i % 2 ? 1 : -1;
      var x = CX + side * (2 + Math.round(R() * 4));
      var y = SOIL - 3 - Math.round(R() * (t + 1) * 2.2);
      blob(g, x, y, 2, 2, i % 3 ? P.leaf : P.dark);
      clear(g, x, y - 2);                        // the heart notch
      set(g, x - 1, y - 1, P.light);
      set(g, x, y + 2, P.dark);
      vline(g, CX, Math.min(y, SOIL - 4), SOIL - 2, P.stem || P.dark);
    }
    if (t === 2) { vline(g, 15, SOIL - 1, SOIL + 3, P.dark); set(g, 15, SOIL + 3, P.leaf); }
  };

  // Snake plant - rigid vertical blades
  ARCH.spike = function (g, P, t) {
    var n = [3, 4, 6][t], top = [8, 4, 0][t], i;
    for (i = 0; i < n; i++) {
      var lean = Math.round((i - (n - 1) / 2) * 2);
      var x = CX + lean, ty = top + Math.abs(lean) * 2;
      vline(g, x, ty + 1, SOIL - 2, P.dark);
      vline(g, x + 1, ty, SOIL - 2, P.leaf);
      for (var y = ty + 2; y < SOIL - 2; y += 3) set(g, x + 1, y, P.light);
      if (P.accent) { set(g, x + 1, ty, P.accent); set(g, x, ty + 1, P.accent); }
    }
  };

  // Jasmine, geranium, bougainvillea - a bush carrying flower clusters
  ARCH.flower = function (g, P, t) {
    var rx = [4, 6, 7][t], ry = [3, 4, 5][t], cy = SOIL - 3 - ry;
    vline(g, CX, cy, SOIL - 2, P.stem || P.dark);
    blob(g, CX, cy, rx, ry, P.dark);
    blob(g, CX, cy, rx - 1, ry - 1, P.leaf);
    if (t >= 1 && P.accent) {
      var pts = t === 2
        ? [[0, -ry + 1], [-4, -1], [4, -2], [-2, 2], [3, 2], [1, 0], [-3, -3]]
        : [[0, -ry + 1], [-3, 0]];
      for (var i = 0; i < pts.length; i++) {
        var fx = CX + pts[i][0], fy = cy + pts[i][1];
        if (!inBlob(fx, fy, CX, cy, rx + 1, ry + 1)) continue;
        blob(g, fx, fy, 1, 1, P.accent);
        set(g, fx, fy, P.accent2 || P.light2 || "#f6efdc");
      }
    }
  };

  /* ---------- public ---------- */
  function draw(sp, stage) {
    // sp is a species record: { arch: "bush", art: { ...palette } }
    var P = sp.art || sp, g = grid();
    pot(g, sp.container || P.container || "pot", P);
    if (stage <= 0) { seed(g, P); return g; }
    if (stage === 1) { sprout(g, P); return g; }
    var fn = ARCH[sp.arch];
    if (!fn) throw new Error("unknown archetype: " + sp.arch);
    fn(g, P, Math.max(0, Math.min(2, stage - 2)));
    return g;
  }

  var OUTLINE = "#2a1c10";

  // Dilate the silhouette by one cell and paint the ring behind the art.
  function outline(g) {
    var out = [], y, x, add = [];
    for (y = 0; y < H + 2; y++) { out[y] = []; for (x = 0; x < W + 2; x++) out[y][x] = null; }
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) out[y + 1][x + 1] = g[y][x];
    for (y = 0; y < H + 2; y++) for (x = 0; x < W + 2; x++) {
      if (out[y][x]) continue;
      var touch = false;
      for (var dy = -1; dy <= 1 && !touch; dy++) for (var dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        var ny = y + dy, nx = x + dx;
        if (ny < 0 || nx < 0 || ny >= H + 2 || nx >= W + 2) continue;
        if (out[ny][nx]) { touch = true; break; }
      }
      if (touch) add.push([x, y]);
    }
    for (var i = 0; i < add.length; i++) out[add[i][1]][add[i][0]] = OUTLINE;
    return out;
  }

  function toCanvas(cv, sp, stage, scale, opts) {
    opts = opts || {};
    var g = opts.outline === false ? draw(sp, stage) : outline(draw(sp, stage));
    var GH = g.length, GW = g[0].length;
    var ctx = cv.getContext("2d"), x, y;
    cv.width = GW * scale; cv.height = GH * scale;
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (opts.shadow) {                       // a soft ellipse so it sits on a surface
      ctx.fillStyle = "rgba(43,29,18,0.16)";
      var sh = Math.max(2, Math.round(scale * 1.2));
      ctx.beginPath();
      ctx.ellipse(cv.width / 2, cv.height - sh, GW * scale * 0.26, sh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (y = 0; y < GH; y++) for (x = 0; x < GW; x++) {
      if (!g[y][x]) continue;
      ctx.fillStyle = g[y][x];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
    return cv;
  }

  root.Sprites = { W: W, H: H, SOIL: SOIL, draw: draw, outline: outline, toCanvas: toCanvas,
                   archetypes: Object.keys(ARCH) };
})(typeof window !== "undefined" ? window : global);
