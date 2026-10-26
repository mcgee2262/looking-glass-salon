// Hero: big shimmering wordmark over silky 3D hair locks. No scroll pinning: the page just scrolls on.
// Needs global THREE (loaded from CDN on index.html). Falls back to the plain wordmark.
(function () {
  var hero = document.getElementById("hero3d");
  if (!hero) return;
  var stage = hero.querySelector(".stage");
  var canvas = document.getElementById("mirror-canvas");
  var mark = hero.querySelector(".wordmark");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fallback() { hero.classList.add("no3d"); }
  if (!window.THREE) return fallback();

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return fallback(); }

  var small = window.innerWidth < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  var START_Z = 8.2;
  camera.position.set(0, 0, START_Z);

  function canvasTex(w, h, draw) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }

  // ---- environment: soft sage and brass "room" so the metal reflects something real
  var envScene = new THREE.Scene();
  var envTex = canvasTex(1024, 512, function (g, w, h) {
    var v = g.createLinearGradient(0, 0, 0, h);
    v.addColorStop(0, "#ffffff"); v.addColorStop(0.3, "#f6efd8"); v.addColorStop(0.55, "#bccaa8"); v.addColorStop(0.8, "#c4a665"); v.addColorStop(1, "#6f5a2c");
    g.fillStyle = v; g.fillRect(0, 0, w, h);
    [[200, 150, 120, "rgba(255,255,255,.9)"], [620, 120, 150, "rgba(246,232,190,.85)"], [880, 250, 90, "rgba(255,255,255,.7)"],
     [420, 330, 140, "rgba(140,170,120,.7)"]].forEach(function (b) {
      var r = g.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
      r.addColorStop(0, b[3]); r.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = r; g.fillRect(0, 0, w, h);
    });
  });
  envTex.wrapS = THREE.RepeatWrapping;
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ map: envTex, side: THREE.BackSide })));
  var pmrem = new THREE.PMREMGenerator(renderer);
  var envMap = pmrem.fromScene(envScene, 0.02).texture;
  pmrem.dispose();

  scene.add(new THREE.AmbientLight(0xfff3dc, 0.35));
  var lamp = new THREE.PointLight(0xfff0e6, 1.5, 16); lamp.position.set(0, 0, 3); scene.add(lamp);
  var fillL = new THREE.PointLight(0x9fb98e, 1.2, 30); fillL.position.set(-4, -2, 4); scene.add(fillL);

  // ---- hair: silky locks that sweep in from the corners behind the mirror and part around the pointer
  var hairMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.0, envMap: envMap, envMapIntensity: 0.45 });
  hairMat.color.setScalar(0.84);
  var hairGroup = new THREE.Group(); scene.add(hairGroup);
  var HSEG = small ? 56 : 110, HSTR = small ? 6 : 9;
  // colors come from Brandie's real work: honey blonde, copper, ash blonde, espresso, caramel
  var LOCKS = [
    { c0: 0x5e3d18, c1: 0xc79a52, lane: -1.00, ph: 0.0, sp: 0.50, amp: 0.20, z: -1.3, w: 0.46 },  // honey
    { c0: 0x4a1d0c, c1: 0x9c4a22, lane:  0.95, ph: 1.7, sp: 0.42, amp: 0.18, z: -1.7, w: 0.50 },  // copper
    { c0: 0x7a6d58, c1: 0xb9ad96, lane: -0.80, ph: 3.1, sp: 0.46, amp: 0.22, z: -0.9, w: 0.40 },  // ash blonde
    { c0: 0x1c100a, c1: 0x5a3a28, lane:  0.80, ph: 4.4, sp: 0.38, amp: 0.20, z: -2.1, w: 0.46 },  // espresso
    { c0: 0x59381a, c1: 0xa87e42, lane: -0.90, ph: 5.2, sp: 0.55, amp: 0.16, z: -0.6, w: 0.34 },  // caramel
    { c0: 0x4a1d0c, c1: 0x93441f, lane:  0.88, ph: 2.4, sp: 0.47, amp: 0.15, z: -1.1, w: 0.32 }   // copper, thinner
  ].slice(0, small ? 4 : 6);
  var tmpc = new THREE.Color(), tmpd = new THREE.Color();
  LOCKS.forEach(function (L2, li) {
    var nv = HSTR * (HSEG + 1) * 2;
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nv * 3), 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(nv * 3), 3).setUsage(THREE.DynamicDrawUsage));
    var col = new Float32Array(nv * 3), idx = [];
    for (var k = 0; k < HSTR; k++) {
      var vary = 0.9 + ((k * 37 + li * 11) % 10) / 10 * 0.2;
      for (var i = 0; i <= HSEG; i++) {
        var u = Math.pow(i / HSEG, 1.15);
        tmpc.setHex(L2.c0).lerp(tmpd.setHex(L2.c1), u).multiplyScalar(vary);
        var o = (k * (HSEG + 1) + i) * 2 * 3;
        col[o] = col[o + 3] = tmpc.r; col[o + 1] = col[o + 4] = tmpc.g; col[o + 2] = col[o + 5] = tmpc.b;
        if (i < HSEG) { var a = (k * (HSEG + 1) + i) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setIndex(idx);
    L2.mesh = new THREE.Mesh(geo, hairMat); L2.mesh.frustumCulled = false;
    hairGroup.add(L2.mesh);
  });
  var HW = 4.2, HH = 2.8, hairYC = 0.1, hairTall = false; // set in resize()
  var pt = [0, 0, 0], pt2 = [0, 0, 0];
  function lockPoint(L2, s, t, out, cx, cy) {
    var lane = hairTall ? -0.15 - 0.75 * Math.abs(L2.lane) : L2.lane * 1.2;   // phones keep the strands low, clear of the title
    var xn = -1.25 + 2.5 * s;                                     // sweeps the full width
    var cv = 1 - 0.5 * Math.pow(s, 1.4);                        // starts in the corner, converges toward the mirror
    var yn = hairYC + (lane - hairYC) * cv
      + L2.amp * Math.sin(s * 6.0 + t * L2.sp + L2.ph) * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, s * 1.1)))
      + 0.08 * Math.sin(s * 14 + t * L2.sp * 1.6 + L2.ph);
    var x = xn * HW, y = yn * HH, z = L2.z + 0.45 * Math.sin(s * 4 + L2.ph + t * 0.4);
    var dx = x - cx, dy = y - cy, g = Math.exp(-(dx * dx + dy * dy) / 1.6);   // the strands part around the pointer
    y += (dy >= 0 ? 1 : -1) * Math.min(Math.abs(dy) + 0.2, 0.9) * g * 0.9;
    out[0] = x; out[1] = y; out[2] = z;
  }
  function updateHair(t, cx, cy, grow) {
    var hf = Math.min(1, HW / 3.6);   // thinner strands on narrow screens
    LOCKS.forEach(function (L2) {
      var pos = L2.mesh.geometry.attributes.position.array, nor = L2.mesh.geometry.attributes.normal.array;
      for (var k = 0; k < HSTR; k++) {
        var off = (k - (HSTR - 1) / 2);
        for (var i = 0; i <= HSEG; i++) {
          var s = i / HSEG;
          lockPoint(L2, s, t, pt, cx, cy); lockPoint(L2, Math.min(1, s + 0.012), t, pt2, cx, cy);
          var tx = pt2[0] - pt[0], ty = pt2[1] - pt[1], tz = pt2[2] - pt[2];
          if (s > 0.985) { lockPoint(L2, s - 0.012, t, pt2, cx, cy); tx = pt[0] - pt2[0]; ty = pt[1] - pt2[1]; tz = pt[2] - pt2[2]; }
          var tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1; tx /= tl; ty /= tl; tz /= tl;
          // side vector: perpendicular to the flow, facing the camera, twisted along the length
          var sx = -ty * 1, sy = tx * 1, sz = 0, sl = Math.sqrt(sx * sx + sy * sy) || 1; sx /= sl; sy /= sl;   // N0 x T with N0 = (0,0,1)
          var bx = ty * sz - tz * sy, by = tz * sx - tx * sz, bz = tx * sy - ty * sx;                          // B = T x S
          var th = 1.25 * Math.sin(s * 3.4 + L2.ph + t * 0.55 + k * 0.35) + s * 1.1, c = Math.cos(th), sn = Math.sin(th);
          var rx = sx * c + bx * sn, ry = sy * c + by * sn, rz = sz * c + bz * sn;
          var lat = off * 0.042 * hf * (0.7 + 0.5 * Math.sin(s * 4.1 + L2.ph + k));                                // strands part and rejoin
          var w = L2.w / HSTR * (0.25 + 0.75 * Math.pow(Math.sin(Math.PI * s), 0.5)) * grow * 2.2 * hf;
          var cxp = pt[0] + rx * lat * 4, cyp = pt[1] + ry * lat * 4, czp = pt[2] + rz * lat * 4;
          var o = (k * (HSEG + 1) + i) * 6;
          pos[o] = cxp + rx * w; pos[o + 1] = cyp + ry * w; pos[o + 2] = czp + rz * w;
          pos[o + 3] = cxp - rx * w; pos[o + 4] = cyp - ry * w; pos[o + 5] = czp - rz * w;
          var nx2 = ty * rz - tz * ry, ny2 = tz * rx - tx * rz, nz2 = tx * ry - ty * rx;
          nor[o] = nor[o + 3] = nx2; nor[o + 1] = nor[o + 4] = ny2; nor[o + 2] = nor[o + 5] = nz2;
        }
      }
      L2.mesh.geometry.attributes.position.needsUpdate = true; L2.mesh.geometry.attributes.normal.needsUpdate = true;
    });
  }

  // ---- pointer: the strands part around it
  var nx = 0, ny = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", function (e) {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    var halfW = START_Z * Math.tan(19 * Math.PI / 180) * camera.aspect;
    HW = halfW; HH = START_Z * Math.tan(19 * Math.PI / 180);
    var wide = w >= 760 && w / h >= 1.05;
    hairYC = wide ? 0.0 : -0.35; hairTall = !wide;
    hero.classList.toggle("tall", !wide);
  }
  window.addEventListener("resize", function () { small = window.innerWidth < 700; resize(); });
  resize();

  var visible = true, t0 = performance.now();
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !reduce) loop(); }).observe(hero);

  function frame(now) {
    var t = (now - t0) / 1000;
    var intro = reduce ? 1 : Math.min(1, t / 2.6); intro = intro * intro * (3 - 2 * intro);
    nx += (tx - nx) * 0.06; ny += (ty - ny) * 0.06;
    updateHair(t, nx * HW * 0.8, -ny * HH * 0.8, 0.35 + 0.65 * intro);
    lamp.position.set(nx * 3.8, -ny * 2.6, 3);
    renderer.render(scene, camera);
    // the wordmark shimmers by itself and follows the pointer
    mark.style.setProperty("--shine", (50 + Math.sin(t * 0.55) * 30 + nx * 25) + "%");
  }

  var running = false;
  function loop() {
    if (running) return;
    running = true;
    (function tick(now) {
      if (!visible) { running = false; return; }
      frame(now);
      requestAnimationFrame(tick);
    })(performance.now());
  }
  if (reduce) { frame(performance.now()); } else { loop(); }
})();
