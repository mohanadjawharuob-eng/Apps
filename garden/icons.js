/* 12x12 pixel icons, drawn with the same primitives as the plants so the whole
   interface reads as one hand. Referenced by the design as data-icon="sun" etc. */
(function (root) {
  var N = 12;
  function grid() { var g = []; for (var y = 0; y < N; y++) { g[y] = []; for (var x = 0; x < N; x++) g[y][x] = null; } return g; }
  function px(g, x, y, c) { if (x < 0 || y < 0 || x >= N || y >= N || !c) return; g[y][x] = c; }
  function disc(g, cx, cy, r, c) {
    for (var y = -r; y <= r; y++) for (var x = -r; x <= r; x++)
      if (x * x + y * y <= r * r + r * 0.4) px(g, cx + x, cy + y, c);
  }
  function rect(g, x0, y0, x1, y1, c) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) px(g, x, y, c); }

  var C = { gold: "#e8b53f", goldD: "#b8842a", pale: "#f2ead6", blue: "#5f93c4",
            blueD: "#3f6b96", leaf: "#5f9b3c", leafD: "#3f6b2a", ink: "#45301c",
            rust: "#c96a2e", white: "#fbf3dd" };

  var ICONS = {
    sun: function (g) {
      disc(g, 6, 6, 3, C.gold);
      disc(g, 6, 6, 2, C.pale);
      [[6,0],[6,11],[0,6],[11,6],[2,2],[9,9],[9,2],[2,9]].forEach(function (p) { px(g, p[0], p[1], C.goldD); });
      [[6,1],[6,10],[1,6],[10,6]].forEach(function (p) { px(g, p[0], p[1], C.gold); });
    },
    moon: function (g) {
      disc(g, 5, 6, 5, C.pale);
      // carve the crescent: px() ignores a null colour, so clear cells directly
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var dx = x - 2, dy = y - 4;
        if (dx * dx + dy * dy <= 20) g[y][x] = null;
      }
      px(g, 9, 2, C.gold); px(g, 10, 7, C.gold);
    },
    drop: function (g) {
      px(g, 6, 1, C.blueD);
      rect(g, 5, 2, 6, 3, C.blue);
      rect(g, 4, 4, 7, 5, C.blue);
      disc(g, 6, 7, 3, C.blue);
      rect(g, 5, 5, 6, 7, C.pale);
      px(g, 4, 7, C.blueD); px(g, 8, 7, C.blueD); px(g, 6, 10, C.blueD);
    },
    can: function (g) {
      rect(g, 3, 5, 8, 10, C.rust);
      rect(g, 3, 4, 8, 4, C.ink);
      rect(g, 4, 6, 5, 8, "#e08a52");
      rect(g, 9, 6, 10, 6, C.ink);
      rect(g, 10, 5, 11, 5, C.ink);
      px(g, 2, 3, C.ink); px(g, 3, 2, C.ink); px(g, 4, 2, C.ink); px(g, 5, 3, C.ink);
      px(g, 11, 4, C.blue); px(g, 10, 3, C.blue);
    },
    leaf: function (g) {
      disc(g, 6, 6, 4, C.leaf);
      rect(g, 2, 9, 4, 11, null);
      rect(g, 8, 1, 10, 3, null);
      for (var i = 0; i < 7; i++) px(g, 3 + i, 9 - i, C.leafD);
      px(g, 2, 10, C.leafD); px(g, 3, 10, C.leafD);
    },
    wind: function (g) {
      var W = "#7fa3b8", WD = "#4f7488";
      rect(g, 1, 3, 7, 3, W); px(g, 8, 2, WD); px(g, 9, 3, WD); px(g, 8, 4, WD);
      rect(g, 2, 6, 9, 6, W); px(g, 10, 5, WD); px(g, 10, 7, WD);
      rect(g, 1, 9, 6, 9, W); px(g, 7, 8, WD); px(g, 8, 9, WD);
    },
    sparkle: function (g) {
      rect(g, 5, 0, 6, 11, C.goldD);
      rect(g, 0, 5, 11, 6, C.goldD);
      rect(g, 5, 2, 6, 9, C.gold);
      rect(g, 2, 5, 9, 6, C.gold);
      rect(g, 4, 4, 7, 7, C.gold);
      rect(g, 5, 5, 6, 6, "#fff3c4");
    }
  };

  function draw(name) {
    var g = grid(); var fn = ICONS[name];
    if (fn) fn(g);
    return g;
  }
  root.BustanIcons = { N: N, draw: draw, names: Object.keys(ICONS) };
})(typeof window !== "undefined" ? window : global);
