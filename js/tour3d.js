// 3D studio tour: a simple modelled version of the studio (light oak floor, sage walls, round mirrors, black chairs,
// shampoo bowls, lounge corner) that the camera glides through in six stops. Each stop shows the matching real photo.
// The 3D room is an illustration built from the photos; the layout is simplified.
(function () {
  var root = document.getElementById("tour");
  if (!root) return;
  var canvas = root.querySelector("canvas");
  var STOPS = [
    { title: "Welcome",          text: "A wide look at the studio: the front desk, shampoo bowls and big windows.", photo: "assets/studio/studio-3.jpg", cam: [0.8, 1.65, 4.6],  look: [-0.5, 1.3, -2.5] },
    { title: "Styling stations", text: "Black chairs and round mirrors on light wood floors.",                         photo: "assets/studio/studio-1.jpg", cam: [-3.0, 1.55, -0.6], look: [-3.0, 1.6, -5] },
    { title: "By the windows",   text: "Two shampoo bowls, a hooded dryer and lots of daylight.",                      photo: "assets/studio/studio-6.jpg", cam: [1.5, 1.7, 1.6],    look: [-6, 1.5, -2.5] },
    { title: "Shampoo bowls",    text: "Two bowls under a shelf, just off the main floor.",                            photo: "assets/studio/studio-4.jpg", cam: [2.4, 1.6, 2.6],    look: [6.3, 0.9, -0.5] },
    { title: "Lounge corner",    text: "Two armchairs, a patterned rug and a hooded dryer.",                           photo: "assets/studio/studio-2.jpg", cam: [-1.2, 1.6, 0.6],   look: [-5.2, 0.8, 3.0] },
    { title: "Waiting area",     text: "Armchairs, a rug and coat hooks while you wait.",                              photo: "assets/studio/studio-5.jpg", cam: [1.4, 1.6, 3.4],    look: [-4.5, 1.0, 3.4] }
  ];
  var N = STOPS.length, cur = 0;
  var el = {
    img: root.querySelector(".tour-card img"), title: root.querySelector(".tour-card strong"), text: root.querySelector(".tour-card span"),
    count: root.querySelector(".tour-count"), dots: root.querySelector(".tour-dots")
  };
  el.dots.innerHTML = STOPS.map(function (s, i) { return '<button type="button" data-i="' + i + '" aria-label="Stop ' + (i + 1) + ': ' + s.title + '"></button>'; }).join("");
  function label(i) {
    var s = STOPS[i];
    el.img.src = s.photo; el.img.alt = "Photo of the studio: " + s.title.toLowerCase();
    el.title.textContent = s.title; el.text.textContent = s.text; el.count.textContent = (i + 1) + " of " + N;
    el.dots.querySelectorAll("button").forEach(function (b, k) { b.setAttribute("aria-current", k === i ? "true" : "false"); });
  }
  var go = function (i) { cur = (i + N) % N; label(cur); if (api.fly) api.fly(cur); };
  var api = {};
  root.querySelector(".tour-prev").addEventListener("click", function () { go(cur - 1); });
  root.querySelector(".tour-next").addEventListener("click", function () { go(cur + 1); });
  el.dots.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) go(+b.dataset.i); });
  root.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") { go(cur - 1); e.preventDefault(); } if (e.key === "ArrowRight") { go(cur + 1); e.preventDefault(); } });
  label(0);

  if (!window.THREE) { root.classList.add("no3d"); return; }
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" }); } catch (e) { root.classList.add("no3d"); return; }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.innerWidth < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.4 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.88;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = small ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe9ecdf);
  var camera = new THREE.PerspectiveCamera(56, 1, 0.05, 60);

  // ---------- helpers
  function ctex(w, h, draw, srgb) {
    var c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb !== false) t.encoding = THREE.sRGBEncoding; return t;
  }
  function noise(g, w, h, n, a, dark) { for (var i = 0; i < n; i++) { var v = Math.random(); g.fillStyle = (dark ? "rgba(0,0,0," : "rgba(255,255,255,") + (v * a) + ")"; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
  function PBR(o) { return new THREE.MeshStandardMaterial(o); }

  // ---------- environment: a bright, soft interior so metal and glass have something to reflect
  var envScene = new THREE.Scene();
  var envTex = ctex(1024, 512, function (g, w, h) {
    var v = g.createLinearGradient(0, 0, 0, h);
    v.addColorStop(0, "#fffdf3"); v.addColorStop(0.35, "#f1f0dc"); v.addColorStop(0.5, "#cdd8b8"); v.addColorStop(0.62, "#b9a17a"); v.addColorStop(1, "#6e5b3d");
    g.fillStyle = v; g.fillRect(0, 0, w, h);
    g.fillStyle = "#ffffff"; g.fillRect(90, 150, 200, 120); g.fillRect(340, 150, 200, 120); // windows
    for (var i = 0; i < 8; i++) { g.fillStyle = "rgba(255,248,225,.9)"; g.beginPath(); g.arc(560 + i * 50, 60, 9, 0, 6.3); g.fill(); } // ceiling lights
  });
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ map: envTex, side: THREE.BackSide })));
  var pm = new THREE.PMREMGenerator(renderer); var envMap = pm.fromScene(envScene, 0.04).texture; pm.dispose();
  scene.environment = envMap;

  // ---------- textures
  var oakTex = ctex(1024, 1024, function (g, w, h) {
    var cols = ["#d8bd92", "#cfb085", "#dcc49a", "#c9ab7f", "#d4b78b"], pw = 128;
    for (var i = 0; i < 8; i++) {
      var off = (i % 2) * 300;
      for (var x = -off; x < w; x += 330) {
        g.fillStyle = cols[(i * 3 + Math.floor(x / 330) + 5) % 5]; g.fillRect(x, i * pw, 330, pw);
        for (var k = 0; k < 26; k++) { g.strokeStyle = "rgba(120,80,40," + (0.05 + Math.random() * 0.1) + ")"; g.lineWidth = 1 + Math.random(); var yy = i * pw + Math.random() * pw; g.beginPath(); g.moveTo(x, yy); g.bezierCurveTo(x + 100, yy + (Math.random() - .5) * 10, x + 230, yy + (Math.random() - .5) * 10, x + 330, yy + (Math.random() - .5) * 6); g.stroke(); }
        g.strokeStyle = "rgba(70,45,20,.35)"; g.lineWidth = 2; g.strokeRect(x, i * pw, 330, pw);
      }
    }
  });
  oakTex.repeat.set(2.4, 2);
  var plasterTex = ctex(512, 512, function (g, w, h) { g.fillStyle = "#b6c3a3"; g.fillRect(0, 0, w, h); var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "rgba(255,255,255,.05)"); gr.addColorStop(1, "rgba(0,0,0,.05)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); noise(g, w, h, 300, 0.012, false); noise(g, w, h, 300, 0.012, true); });
  plasterTex.repeat.set(2, 1);
  var plasterBump = ctex(256, 256, function (g, w, h) { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); noise(g, w, h, 3000, 0.5, false); noise(g, w, h, 3000, 0.5, true); }, false); plasterBump.repeat.set(3, 1.5);
  var creamPlaster = ctex(256, 256, function (g, w, h) { g.fillStyle = "#f2eddc"; g.fillRect(0, 0, w, h); noise(g, w, h, 1500, 0.05, true); }); creamPlaster.repeat.set(4, 2);
  var ceilTex = ctex(512, 512, function (g, w, h) { g.fillStyle = "#f7f5ee"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(0,0,0,.14)"; g.lineWidth = 3; g.strokeRect(0, 0, w / 2, h / 2); g.strokeRect(w / 2, 0, w / 2, h / 2); g.strokeRect(0, h / 2, w / 2, h / 2); g.strokeRect(w / 2, h / 2, w / 2, h / 2); noise(g, w, h, 1500, 0.05, true); }); ceilTex.repeat.set(7, 5.5);
  var leatherBump = ctex(128, 128, function (g, w, h) { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); noise(g, w, h, 1800, 0.6, true); noise(g, w, h, 1800, 0.6, false); }, false); leatherBump.repeat.set(3, 3);
  var rugTex = ctex(512, 512, function (g, w, h) {
    g.fillStyle = "#efe7d2"; g.fillRect(0, 0, w, h); g.translate(w / 2, h / 2);
    [[240, "#b7c4a4", 14], [205, "#8e9f7c", 4], [160, "#cdb26c", 6], [118, "#b7c4a4", 18], [70, "#efe7d2", 0]].forEach(function (r) { g.strokeStyle = r[1]; g.lineWidth = r[2]; g.beginPath(); g.arc(0, 0, r[0], 0, 6.3); g.stroke(); });
    for (var i = 0; i < 24; i++) { g.save(); g.rotate(i / 24 * 6.283); g.fillStyle = "#8e9f7c"; g.beginPath(); g.moveTo(0, -130); g.lineTo(9, -150); g.lineTo(-9, -150); g.fill(); g.restore(); }
    noise(g, -w / 2, -h / 2, 0, 0, false);
  });
  var outsideTex = ctex(512, 256, function (g, w, h) {
    var v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, "#cfe6f2"); v.addColorStop(0.6, "#f4f7ee"); v.addColorStop(1, "#9fb98a"); g.fillStyle = v; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 40; i++) { g.fillStyle = "rgba(90,125,70," + (0.25 + Math.random() * 0.4) + ")"; g.beginPath(); g.arc(Math.random() * w, h * 0.72 + Math.random() * h * 0.28, 14 + Math.random() * 34, 0, 6.3); g.fill(); }
  });

  // ---------- materials
  var M = {
    plaster: PBR({ color: 0xffffff, map: plasterTex, roughness: 0.95 }),
    cream: PBR({ color: 0xffffff, map: creamPlaster, roughness: 0.9 }),
    oakFloor: PBR({ color: 0xddc6a0, map: oakTex, bumpMap: oakTex, bumpScale: 0.5, roughness: 0.42, envMapIntensity: 0.55 }),
    ceiling: PBR({ color: 0xffffff, map: ceilTex, roughness: 0.95 }),
    oak: PBR({ color: 0xcfb287, roughness: 0.55 }), oakDark: PBR({ color: 0xa88a5e, roughness: 0.6 }),
    white: PBR({ color: 0xf7f5ee, roughness: 0.35 }), ceramic: PBR({ color: 0xffffff, roughness: 0.12, envMapIntensity: 1.1 }),
    leather: PBR({ color: 0x0c0c0b, roughness: 0.5, envMapIntensity: 0.45 }),
    fabric: PBR({ color: 0x3a4650, roughness: 0.95,  }),
    fabricSage: PBR({ color: 0x8aa07a, roughness: 0.95,  }),
    brass: PBR({ color: 0xc2a05a, roughness: 0.25, metalness: 1, envMapIntensity: 1.3 }),
    chrome: PBR({ color: 0xdfe3e0, roughness: 0.12, metalness: 1, envMapIntensity: 1.3 }),
    black: PBR({ color: 0x20201e, roughness: 0.5 }),
    mirror: PBR({ color: 0xe3ece6, roughness: 0.03, metalness: 1, envMapIntensity: 1.4 }),
    leaf: PBR({ color: 0x5f8250, roughness: 0.7 }), leaf2: PBR({ color: 0x7f9d62, roughness: 0.7 }),
    rug: PBR({ color: 0xffffff, map: rugTex, roughness: 1 }),
    glow: new THREE.MeshBasicMaterial({ color: 0xfff6dc }),
    amber: PBR({ color: 0x8a5a24, roughness: 0.2, transparent: true, opacity: 0.92 }), frostglass: PBR({ color: 0xe9efe6, roughness: 0.25, transparent: true, opacity: 0.8 })
  };

  var cache = {};
  function rbox(w, h, d, r, mat, cast) {
    var key = [w, h, d, r].join(","), g = cache[key];
    if (!g) {
      var b = Math.min(r * 0.45, d * 0.3, 0.03), x = -w / 2, y = -h / 2, s = new THREE.Shape();
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b * 0.9, bevelSegments: 2, curveSegments: 5 });
      g.translate(0, 0, -(d - 2 * b) / 2); cache[key] = g;
    }
    var m = new THREE.Mesh(g, mat); m.castShadow = cast !== false; m.receiveShadow = true; return m;
  }
  function P(m, x, y, z, parent) { m.position.set(x, y, z); (parent || scene).add(m); return m; }
  function box(w, h, d, mat, x, y, z, parent, shadow) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = shadow !== false; m.receiveShadow = true; return P(m, x, y, z, parent); }
  function cyl(rt, rb, h, mat, x, y, z, parent, seg, shadow) { var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 28), mat); m.castShadow = shadow !== false; m.receiveShadow = true; return P(m, x, y, z, parent); }
  function sph(r, mat, x, y, z, parent, sx, sy, sz) { var m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat); m.scale.set(sx || 1, sy || 1, sz || 1); m.castShadow = true; return P(m, x, y, z, parent); }
  // soft contact shadows (fake ambient occlusion) so furniture sits on the floor instead of floating
  var blobTex = ctex(128, 128, function (g, w, h) { var r = g.createRadialGradient(64, 64, 4, 64, 64, 62); r.addColorStop(0, "rgba(40,30,15,.55)"); r.addColorStop(1, "rgba(40,30,15,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  function blob(x, z, w, d, o) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity: o == null ? 0.9 : o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.006, z); scene.add(m); }
  var edgeTex = ctex(8, 64, function (g, w, h) { var r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, "rgba(40,30,15,.45)"); r.addColorStop(1, "rgba(40,30,15,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  function edge(x, z, len, ang) { var m = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.6), new THREE.MeshBasicMaterial({ map: edgeTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = ang; m.position.set(x, 0.008, z); scene.add(m); }

  // ---------- room shell with real window openings (so the sun throws window-frame shadows on the floor)
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(14.2, 11.2), M.oakFloor); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 0.25); floor.receiveShadow = true; scene.add(floor);
  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(14.2, 11.2), M.ceiling); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.4, 0.25); scene.add(ceil);
  box(14.4, 3.4, 0.2, M.plaster, 0, 1.7, -5.1, null, false).receiveShadow = true;       // back wall (sage)
  box(14.4, 3.4, 0.2, M.cream, 0, 1.7, 5.7, null, false);                                // front wall
  box(0.2, 3.4, 11.4, M.cream, 7.1, 1.7, 0.25, null, false);                             // right wall
  // left wall in pieces around three window openings (z centers, 2.4 wide, 0.85 to 2.75 high)
  var WZ = [-3.2, 0.2, 3.4], WH = 1.9, WY = 1.8;
  var zEdges = [-5.3]; WZ.forEach(function (z) { zEdges.push(z - 1.2, z + 1.2); }); zEdges.push(5.8);
  for (var wi = 0; wi < zEdges.length; wi += 2) { var z0 = zEdges[wi], z1 = zEdges[wi + 1]; box(0.2, 3.4, z1 - z0, M.plaster, -7.1, 1.7, (z0 + z1) / 2, null, true); }
  WZ.forEach(function (z) {
    box(0.2, WY - WH / 2, 2.4, M.plaster, -7.1, (WY - WH / 2) / 2, z, null, true);                       // below
    box(0.2, 3.4 - (WY + WH / 2), 2.4, M.plaster, -7.1, (WY + WH / 2 + 3.4) / 2, z, null, true);        // above
    // frame: sill, head, jambs and a mullion cross that will cast shadows
    box(0.34, 0.07, 2.5, M.white, -7.0, WY - WH / 2, z); box(0.1, 0.07, 2.5, M.white, -7.02, WY + WH / 2, z);
    box(0.1, WH, 0.07, M.white, -7.02, WY, z - 1.2); box(0.1, WH, 0.07, M.white, -7.02, WY, z + 1.2);
    box(0.07, WH, 0.06, M.white, -7.04, WY, z); box(0.07, 0.06, 2.4, M.white, -7.04, WY + 0.15, z);
  });
  var sky = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), new THREE.MeshBasicMaterial({ map: outsideTex, fog: false })); sky.rotation.y = Math.PI / 2; sky.position.set(-14, 2.2, 0.3); scene.add(sky);
  // baseboards, ceiling light panels, track
  box(14.2, 0.12, 0.04, M.white, 0, 0.06, -4.98, null, false); box(0.04, 0.12, 11, M.white, 6.98, 0.06, 0.25, null, false); box(14.2, 0.12, 0.04, M.white, 0, 0.06, 5.58, null, false); box(0.04, 0.12, 11, M.white, -6.98, 0.06, 0.25, null, false);
  [-3.4, 0, 3.4].forEach(function (x) { [-2.6, 1.2].forEach(function (z) { var p = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.5), M.glow); p.rotation.x = Math.PI / 2; p.position.set(x, 3.39, z); scene.add(p); }); });
  [-4.6, -1.6].forEach(function (x) { box(0.05, 0.05, 6.8, M.black, x, 3.32, -1.4, null, false); for (var k = 0; k < 3; k++) { var hd = cyl(0.07, 0.09, 0.2, M.black, x, 3.2, -4 + k * 1.7, null, 14, false); hd.rotation.x = 0.35; cyl(0.06, 0.06, 0.02, M.glow, x, 3.1 - k * 0.0, -4 + k * 1.7 + 0.02, null, 14, false).rotation.x = 0.35; } });
  edge(0, -4.7, 14, 0); edge(6.7, 0.25, 11, Math.PI / 2); edge(-6.7, 0.25, 11, -Math.PI / 2); edge(0, 5.3, 14, Math.PI);

  // ---------- two styling stations on the back wall
  function salonChair(x, z, rotY) {
    var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY || 0; scene.add(g);
    for (var k = 0; k < 5; k++) { var a = k / 5 * 6.283; var leg = box(0.34, 0.035, 0.07, M.chrome, Math.sin(a) * 0.17, 0.05, Math.cos(a) * 0.17, g); leg.rotation.y = a; cyl(0.035, 0.035, 0.05, M.black, Math.sin(a) * 0.33, 0.022, Math.cos(a) * 0.33, g, 10); }
    cyl(0.1, 0.12, 0.06, M.chrome, 0, 0.08, 0, g); cyl(0.045, 0.045, 0.4, M.chrome, 0, 0.33, 0, g, 14); cyl(0.07, 0.07, 0.12, M.black, 0, 0.52, 0, g);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.012, 8, 36), M.chrome); ring.rotation.x = Math.PI / 2; P(ring, 0, 0.2, 0.0, g);
    P(rbox(0.66, 0.13, 0.62, 0.07, M.leather), 0, 0.6, 0.0, g); P(rbox(0.6, 0.62, 0.13, 0.07, M.leather), 0, 0.97, 0.3, g);
    var arm1 = P(rbox(0.07, 0.07, 0.4, 0.03, M.leather), -0.34, 0.8, 0.02, g), arm2 = P(rbox(0.07, 0.07, 0.4, 0.03, M.leather), 0.34, 0.8, 0.02, g);
    cyl(0.025, 0.025, 0.2, M.chrome, -0.34, 0.7, 0.06, g, 8); cyl(0.025, 0.025, 0.2, M.chrome, 0.34, 0.7, 0.06, g, 8);
    P(rbox(0.36, 0.2, 0.1, 0.05, M.leather), 0, 1.4, 0.34, g);
    return g;
  }
  [-4.6, -1.6].forEach(function (x, i) {
    box(2.3, 0.86, 0.56, M.oak, x, 0.43, -4.68); box(2.4, 0.045, 0.62, M.white, x, 0.88, -4.66); box(2.3, 0.06, 0.04, M.oakDark, x, 0.04, -4.4, null, false);
    for (var d = -1; d <= 1; d += 2) { box(1.08, 0.7, 0.012, M.oakDark, x + d * 0.57, 0.46, -4.395, null, false); box(0.16, 0.012, 0.016, M.brass, x + d * 0.57, 0.72, -4.385, null, false); }
    // mirror: brass rim, reflective glass, a thin plate and a wall light
    var rim = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.045, 18, 64), M.brass); rim.castShadow = true; P(rim, x, 1.95, -4.97);
    var gl = new THREE.Mesh(new THREE.CircleGeometry(0.63, 56), M.mirror); P(gl, x, 1.95, -4.965); cyl(0.66, 0.66, 0.02, M.white, x, 1.95, -4.99, null, 48, false).rotation.x = Math.PI / 2;
    box(0.06, 0.06, 0.12, M.brass, x, 2.78, -4.95); box(0.55, 0.04, 0.04, M.brass, x, 2.82, -4.9); cyl(0.05, 0.05, 0.09, M.glow, x - 0.2, 2.82, -4.9, null, 10, false).rotation.z = Math.PI / 2;
    // things on the counter
    cyl(0.07, 0.06, 0.15, M.ceramic, x - 0.8, 0.98, -4.7, null, 18); [0, 1, 2].forEach(function (k) { var br = box(0.012, 0.18, 0.012, M.black, x - 0.8 + (k - 1) * 0.02, 1.12, -4.7, null, false); br.rotation.z = (k - 1) * 0.12; });
    cyl(0.045, 0.045, 0.2, M.frostglass, x + 0.5, 1.0, -4.72, null, 16); cyl(0.05, 0.05, 0.03, M.brass, x + 0.5, 1.12, -4.72, null, 16);
    cyl(0.04, 0.04, 0.14, M.amber, x + 0.66, 0.96, -4.68, null, 16); box(0.3, 0.07, 0.2, M.cream, x + 0.05, 0.935, -4.68);
    blob(x, -4.5, 2.8, 1.2, 0.8);
    var ch = salonChair(x + (i ? 0.1 : -0.1), -3.45, Math.PI); ch.rotation.y = Math.PI + (i ? 0.12 : -0.1); blob(x + (i ? 0.1 : -0.1), -3.45, 1.3, 1.3, 0.9);
  });
  // wall shelves with products and a plant
  [1.45, 1.82].forEach(function (y, k) {
    box(2.5, 0.05, 0.3, M.oak, 1.7, y, -4.84); [-0.9, -0.55, -0.25, 0.1, 0.45, 0.8, 1.05].forEach(function (dx, j) {
      var h = 0.16 + ((j * 7) % 4) * 0.035, mat = [M.frostglass, M.amber, M.ceramic, M.leaf2, M.cream][(j + k) % 5];
      cyl(0.04 + (j % 2) * 0.01, 0.04 + (j % 2) * 0.01, h, mat, 1.7 + dx, y + 0.025 + h / 2, -4.84, null, 16); cyl(0.036, 0.036, 0.035, M.brass, 1.7 + dx, y + 0.045 + h, -4.84, null, 14, false);
    });
  });
  box(0.04, 0.5, 0.04, M.black, 0.5, 1.65, -4.9, null, false); box(0.04, 0.5, 0.04, M.black, 2.9, 1.65, -4.9, null, false);

  // ---------- shampoo bowls along the right wall
  [-1.45, 0.4].forEach(function (z) {
    box(1.0, 0.9, 0.9, M.oak, 6.5, 0.45, z); box(1.08, 0.05, 0.98, M.white, 6.48, 0.92, z);
    var bowl = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.22, 0.02], [0.32, 0.12], [0.37, 0.2], [0.38, 0.24]].map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 32), M.ceramic); bowl.castShadow = true; bowl.scale.set(1.05, 1, 1.15); P(bowl, 6.3, 0.94, z); bowl.rotation.z = 0;
    cyl(0.03, 0.03, 0.3, M.chrome, 6.72, 1.1, z, null, 12); var fa = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.016, 8, 16, Math.PI), M.chrome); fa.rotation.z = Math.PI; P(fa, 6.64, 1.26, z); cyl(0.012, 0.012, 0.12, M.chrome, 6.55, 1.2, z, null, 8);
    for (var d = -1; d <= 1; d += 2) { box(0.012, 0.6, 0.4, M.oakDark, 6.0, 0.44, z + d * 0.23, null, false); }
    // reclined shampoo chair: the client leans back toward the bowl
    var c = new THREE.Group(); c.position.set(5.1, 0, z); scene.add(c);
    cyl(0.28, 0.32, 0.06, M.chrome, 0, 0.04, 0, c); cyl(0.07, 0.07, 0.5, M.chrome, 0, 0.3, 0, c, 14);
    P(rbox(0.7, 0.14, 0.62, 0.07, M.leather), 0, 0.58, 0, c);
    var bk = new THREE.Group(); bk.position.set(0.3, 0.64, 0); bk.rotation.z = -1.05; c.add(bk); P(rbox(0.14, 0.95, 0.66, 0.07, M.leather), 0, 0.46, 0, bk);
    var lr = P(rbox(0.5, 0.1, 0.5, 0.05, M.leather), -0.55, 0.5, 0, c); lr.rotation.z = 0.45; cyl(0.02, 0.02, 0.22, M.chrome, -0.5, 0.36, 0, c, 8);
    blob(5.2, z, 1.6, 1.3, 0.8);
  });
  box(2.8, 0.05, 0.3, M.oak, 6.8, 1.9, -0.5); [-1.1, -0.6, 0, 0.5, 1.0].forEach(function (dz, j) { cyl(0.05, 0.05, 0.2 + (j % 3) * 0.04, [M.frostglass, M.ceramic, M.amber][j % 3], 6.8, 2.05, -0.5 + dz, null, 16); });

  // ---------- lounge: patterned rug, two armchairs, table, hooded dryer, plants
  var rug = new THREE.Mesh(new THREE.CircleGeometry(1.95, 64), M.rug); rug.rotation.x = -Math.PI / 2; rug.position.set(-4.3, 0.012, 3.0); rug.receiveShadow = true; scene.add(rug);
  function armchair(x, z, rot) {
    var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
    P(rbox(0.86, 0.22, 0.84, 0.1, M.fabric), 0, 0.34, 0, g); P(rbox(0.86, 0.62, 0.2, 0.1, M.fabric), 0, 0.72, -0.34, g);
    P(rbox(0.16, 0.34, 0.84, 0.07, M.fabric), -0.45, 0.52, 0, g); P(rbox(0.16, 0.34, 0.84, 0.07, M.fabric), 0.45, 0.52, 0, g);
    P(rbox(0.5, 0.4, 0.14, 0.12, M.fabricSage), 0.12, 0.62, -0.18, g).rotation.x = -0.25;
    [[-.36, -.34], [.36, -.34], [-.36, .34], [.36, .34]].forEach(function (o) { var l = cyl(0.015, 0.03, 0.22, M.brass, o[0], 0.11, o[1], g, 10); });
    blob(x, z, 1.5, 1.4, 0.8); return g;
  }
  armchair(-5.5, 3.65, 0.65); armchair(-3.15, 3.8, -0.5);
  cyl(0.34, 0.34, 0.03, M.brass, -4.35, 0.5, 3.15); cyl(0.04, 0.04, 0.5, M.brass, -4.35, 0.25, 3.15, null, 12); cyl(0.2, 0.22, 0.02, M.brass, -4.35, 0.01, 3.15, null, 24, false); blob(-4.35, 3.15, 1.1, 1.1, 0.7);
  cyl(0.06, 0.05, 0.1, M.ceramic, -4.4, 0.57, 3.1); sph(0.06, M.leaf, -4.4, 0.66, 3.1);
  var dr = new THREE.Group(); dr.position.set(-6.1, 0, 1.2); scene.add(dr);
  cyl(0.28, 0.32, 0.05, M.chrome, 0, 0.03, 0, dr); cyl(0.04, 0.04, 1.2, M.chrome, 0, 0.62, 0, dr, 14); var arm = box(0.5, 0.05, 0.05, M.chrome, 0.22, 1.25, 0, dr);
  var dome = new THREE.Mesh(new THREE.SphereGeometry(0.4, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), M.white); dome.castShadow = true; P(dome, 0.46, 1.2, 0, dr); dome.rotation.x = Math.PI; dome.position.set(0.46, 1.35, 0); P(rbox(0.7, 0.45, 0.14, 0.1, M.leather), 0.7, 0.55, 0, dr).rotation.y = Math.PI / 2; blob(-6.0, 1.2, 1.2, 1.2, 0.7);
  box(1.5, 0.045, 0.1, M.brass, -4.4, 1.9, 5.58, null, false); [-0.5, 0, 0.5].forEach(function (dx) { cyl(0.015, 0.015, 0.18, M.black, -4.4 + dx, 1.8, 5.5, null, 8, false); sph(0.045, M.black, -4.4 + dx, 1.72, 5.5); });
  box(0.56, 0.7, 0.03, M.oakDark, -2.6, 1.9, 5.58, null, false); box(0.5, 0.64, 0.01, M.cream, -2.6, 1.9, 5.565, null, false);
  box(0.8, 0.5, 0.03, M.oakDark, -1.6, 2.0, 5.58, null, false); box(0.74, 0.44, 0.01, M.fabricSage, -1.6, 2.0, 5.565, null, false);

  // ---------- reception desk with a slatted front, laptop, lamp and a stool
  box(3.1, 1.0, 0.74, M.oak, 4.2, 0.5, 3.6); for (var sl = -14; sl <= 14; sl++) box(0.04, 0.9, 0.03, M.oakDark, 4.2 + sl * 0.105, 0.5, 3.96, null, false);
  box(3.2, 0.06, 0.84, M.white, 4.2, 1.03, 3.6); blob(4.2, 3.7, 3.7, 1.5, 0.8);
  box(0.34, 0.015, 0.24, M.black, 3.5, 1.07, 3.55); var scr = box(0.34, 0.22, 0.012, M.black, 3.5, 1.18, 3.44); scr.rotation.x = -0.25; box(0.3, 0.17, 0.004, M.glow, 3.5, 1.18, 3.436).rotation.x = -0.25;
  cyl(0.1, 0.12, 0.02, M.brass, 5.1, 1.07, 3.5); cyl(0.012, 0.012, 0.3, M.brass, 5.1, 1.22, 3.5, null, 8); var shade = cyl(0.1, 0.16, 0.14, M.cream, 5.1, 1.42, 3.5, null, 24); shade.material = PBR({ color: 0xf4efdc, roughness: 0.9, emissive: 0xffe9b0, emissiveIntensity: 0.35 });
  var st = new THREE.Group(); st.position.set(3.6, 0, 4.5); scene.add(st); cyl(0.2, 0.2, 0.06, M.leather, 0, 0.66, 0, st); cyl(0.03, 0.03, 0.62, M.chrome, 0, 0.33, 0, st, 10); cyl(0.2, 0.2, 0.02, M.chrome, 0, 0.01, 0, st, 20, false); blob(3.6, 4.5, 0.8, 0.8, 0.7);
  [[3.1, 5.2, 1.0], [5.3, 4.9, 0.8]].forEach(function (p) { box(1.4, 0.05, 0.03, M.brass, 6.9, 1.2, 4.2, null, false); });

  // plants: pot plus a cluster of leaf blades
  function plant(x, z, s) {
    var g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s || 1); scene.add(g);
    cyl(0.26, 0.2, 0.46, M.ceramic, 0, 0.23, 0, g, 24); cyl(0.24, 0.24, 0.02, PBR({ color: 0x3b2c1c, roughness: 1 }), 0, 0.45, 0, g, 24);
    for (var q = 0; q < 16; q++) { var a = q / 16 * 6.283 * 2.1, lf = sph(0.11, q % 3 ? M.leaf : M.leaf2, Math.sin(a) * (0.1 + (q % 5) * 0.045), 0.7 + q * 0.055, Math.cos(a) * (0.1 + (q % 5) * 0.045), g, 1, 2.1 + (q % 3) * 0.4, 0.28); lf.rotation.y = a; lf.rotation.z = 0.35 + (q % 4) * 0.09; }
    blob(x, z, 0.9, 0.9, 0.6); return g;
  }
  plant(-6.4, -4.4, 1.4); plant(6.3, 4.8, 1.2); plant(-6.4, 5.0, 1.0); plant(1.0, -4.6, 0.9).position.y = 0;
  // framed art on the right wall
  [[1.8, 2.0, 0.7, 0.9], [2.9, 2.1, 0.55, 0.55], [2.4, 1.0, 0.5, 0.35]].forEach(function (f, i) {
    box(0.03, f[3] + 0.06, f[2] + 0.06, M.brass, 7.0, f[1], f[0] + 0.5, null, false); box(0.01, f[3], f[2], [M.fabricSage, M.cream, M.oakDark][i], 6.98, f[1], f[0] + 0.5, null, false);
  });


  // soft sunbeams from each window (additive, fading toward the floor)
  var beamTex = ctex(32, 128, function (g, w, h) { var r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, "rgba(255,244,205,.0)"); r.addColorStop(0.12, "rgba(255,244,205,.5)"); r.addColorStop(1, "rgba(255,244,205,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); var s2 = g.createLinearGradient(0, 0, w, 0); s2.addColorStop(0, "rgba(0,0,0,1)"); s2.addColorStop(0.2, "rgba(0,0,0,0)"); s2.addColorStop(0.8, "rgba(0,0,0,0)"); s2.addColorStop(1, "rgba(0,0,0,1)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = s2; g.fillRect(0, 0, w, h); });
  var sdir = new THREE.Vector3(11, -6.2, -2).normalize();
  WZ.forEach(function (z) {
    [new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0).cross(sdir).normalize()].forEach(function (wd) {
      var bm = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 7.5), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      var zA = new THREE.Vector3().crossVectors(wd, sdir).normalize(); bm.matrixAutoUpdate = false; var m4 = new THREE.Matrix4().makeBasis(wd, sdir, zA); m4.setPosition(-6.9 + sdir.x * 3.75, WY + sdir.y * 3.75, z + sdir.z * 3.75); bm.matrix.copy(m4); scene.add(bm);
    });
  });

  // ---------- light
  scene.add(new THREE.HemisphereLight(0xfffbe9, 0xc2b690, 0.34));
  var sun = new THREE.DirectionalLight(0xfff1cf, 2.1); sun.position.set(-11, 6.2, 2.0); sun.target.position.set(1, 0, 0.5); scene.add(sun); scene.add(sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048); var sc = sun.shadow.camera; sc.left = -11; sc.right = 11; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 32; sun.shadow.bias = -0.0004; sun.shadow.radius = 3.2;
  [[-4.6, 3.0, -2.4], [-1.6, 3.0, -2.4], [3, 3.0, -1], [-4, 3.0, 3], [3.5, 3.0, 3.6]].forEach(function (p) { var l = new THREE.PointLight(0xfff0d0, 0.34, 9, 1.6); l.position.set(p[0], p[1], p[2]); scene.add(l); });
  var rim = new THREE.PointLight(0xdfeccb, 0.5, 14); rim.position.set(-6, 2.4, 0); scene.add(rim);

  // ---------- camera: a slow, film-like glide between stops; drag to look around
  var pos = new THREE.Vector3().fromArray(STOPS[0].cam), look = new THREE.Vector3().fromArray(STOPS[0].look);
  var fromP = pos.clone(), fromL = look.clone(), toP = pos.clone(), toL = look.clone(), t0 = 0, dur = 2800, lift = 0;
  var yaw = 0, pitch = 0, tyaw = 0, tpitch = 0, drag = null;
  api.fly = function (i) {
    fromP.copy(pos); fromL.copy(look); toP.fromArray(STOPS[i].cam); toL.fromArray(STOPS[i].look); tyaw = 0; tpitch = 0;
    if (reduce) { pos.copy(toP); look.copy(toL); yaw = pitch = 0; render(); } else t0 = performance.now();
  };
  function resize() { var w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 1 ? 74 : 56; camera.updateProjectionMatrix(); render(); }
  window.addEventListener("resize", resize);
  canvas.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, yaw: tyaw, pitch: tpitch }; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", function (e) { if (!drag) return; tyaw = Math.max(-1.2, Math.min(1.2, drag.yaw + (e.clientX - drag.x) * 0.005)); tpitch = Math.max(-0.5, Math.min(0.5, drag.pitch + (e.clientY - drag.y) * 0.004)); });
  function up() { drag = null; canvas.style.cursor = "grab"; }
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);

  var tmp = new THREE.Vector3(), dir = new THREE.Vector3();
  function ease(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function render() {
    var now = performance.now(), u = t0 ? Math.min(1, (now - t0) / dur) : 1, e = ease(u);
    pos.lerpVectors(fromP, toP, e); look.lerpVectors(fromL, toL, e);
    yaw += (tyaw - yaw) * 0.1; pitch += (tpitch - pitch) * 0.1;
    dir.subVectors(look, pos);
    var len = dir.length(), a = Math.atan2(dir.x, dir.z) + yaw, p = Math.asin(dir.y / len) + pitch;
    tmp.set(pos.x + Math.sin(a) * Math.cos(p) * len, pos.y + Math.sin(p) * len, pos.z + Math.cos(a) * Math.cos(p) * len);
    var sway = reduce ? 0 : 1, arc = Math.sin(Math.PI * Math.min(1, u)) * 0.12 * (t0 ? 1 : 0); // a little rise mid-move
    camera.position.set(pos.x + Math.sin(now / 2300) * 0.02 * sway, pos.y + arc + Math.sin(now / 1700) * 0.012 * sway, pos.z + Math.cos(now / 2900) * 0.02 * sway);
    camera.lookAt(tmp);
    renderer.render(scene, camera);
  }
  var visible = false, running = false;
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }).observe(canvas);
  function loop() { if (running) return; running = true; (function tick() { if (!visible) { running = false; return; } render(); requestAnimationFrame(tick); })(); }
  resize(); render();
})();
