// Hero: 3D hand mirror + scroll portal to the second panel.
// Needs global THREE (loaded from CDN on index.html). Falls back to a CSS mirror.
(function () {
  var hero = document.getElementById("hero3d");
  if (!hero) return;
  var stage = hero.querySelector(".stage");
  var canvas = document.getElementById("mirror-canvas");
  var flash = hero.querySelector(".flash");
  var other = hero.querySelector(".other-side");
  var mark = hero.querySelector(".wordmark");
  var cue = hero.querySelector(".cue");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fallback() { hero.classList.add("no3d"); other.classList.add("on"); }
  if (!window.THREE) return fallback();

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return fallback(); }

  var small = window.innerWidth < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  var START_Z = 8.2, END_Z = 0.55;
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

  // lights: soft fill plus a "cursor lamp" that follows the pointer
  scene.add(new THREE.AmbientLight(0xfff3dc, 0.35));
  var lamp = new THREE.PointLight(0xfff0e6, 1.5, 16); lamp.position.set(0, 0, 3); scene.add(lamp);
  var plum = new THREE.PointLight(0x9fb98e, 1.2, 30); plum.position.set(-4, -2, 4); scene.add(plum);

  // ---- materials
  var gold = new THREE.MeshStandardMaterial({ color: 0xb59656, metalness: 1, roughness: 0.26, envMap: envMap, envMapIntensity: 1.05 });
  var bead = new THREE.MeshStandardMaterial({ color: 0xd3bb7e, metalness: 1, roughness: 0.2, envMap: envMap, envMapIntensity: 1.15 });

  // glass: fake reflection, with the wordmark written backwards like a real mirror
  var glassTex = canvasTex(512, 512, function (g, w, h) {
    var lin = g.createLinearGradient(0, 0, w, h);
    lin.addColorStop(0, "#9db38c"); lin.addColorStop(0.45, "#dbe4cb");
    lin.addColorStop(0.75, "#f6f3e4"); lin.addColorStop(1, "#ffffff");
    g.fillStyle = lin; g.fillRect(0, 0, w, h);
    [[130, 150, 150, "rgba(246,236,200,.55)"], [380, 330, 170, "rgba(150,178,130,.55)"],
     [300, 90, 110, "rgba(255,240,230,.45)"]].forEach(function (b) {
      var r = g.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
      r.addColorStop(0, b[3]); r.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = r; g.fillRect(0, 0, w, h);
    });
    g.save(); g.translate(w / 2, h / 2); g.scale(-1, 1 / 1.3); // mirrored; undo oval stretch
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "800 70px system-ui, -apple-system, 'Segoe UI', sans-serif";
    g.fillStyle = "rgba(63,90,60,.35)";
    g.fillText("LOOKING", 0, -42); g.fillText("GLASS", 0, 42);
    g.font = "600 24px system-ui, sans-serif"; g.fillStyle = "rgba(63,90,60,.3)";
    g.fillText("S A L O N", 0, 108);
    g.restore();
  });
  glassTex.repeat.set(0.82, 0.82); glassTex.offset.set(0.09, 0.09);

  var glintTex = canvasTex(256, 256, function (g, w, h) {
    var l = g.createLinearGradient(0, 0, w, 0);
    l.addColorStop(0.35, "rgba(255,255,255,0)"); l.addColorStop(0.5, "rgba(255,255,255,.7)");
    l.addColorStop(0.65, "rgba(255,255,255,0)");
    g.fillStyle = l; g.fillRect(0, 0, w, h);
  });

  var backTex = canvasTex(512, 512, function (g, w, h) {
    var r = g.createRadialGradient(w * .4, h * .35, 20, w / 2, h / 2, w * .55);
    r.addColorStop(0, "#ecdcae"); r.addColorStop(0.6, "#c2a05a"); r.addColorStop(1, "#8a6c2f");
    g.fillStyle = r; g.fillRect(0, 0, w, h);
    g.save(); g.translate(w / 2, h / 2); g.scale(1, 1 / 1.3);
    g.strokeStyle = "rgba(110,72,18,.6)"; g.lineWidth = 3;
    [210, 196, 150].forEach(function (rad) { g.beginPath(); g.arc(0, 0, rad, 0, 6.2832); g.stroke(); });
    for (var i = 0; i < 48; i++) { var a = i / 48 * 6.2832; g.beginPath(); g.arc(Math.cos(a) * 173, Math.sin(a) * 173, 4, 0, 6.2832); g.fillStyle = "rgba(110,72,18,.6)"; g.fill(); }
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = "italic 700 190px Georgia, serif";
    g.fillStyle = "rgba(250,244,224,.6)"; g.fillText("LG", -3, -3);
    g.fillStyle = "rgba(110,72,18,.85)"; g.fillText("LG", 0, 0);
    g.restore();
  });

  var seg = small ? 48 : 96;
  var rig = new THREE.Group(); scene.add(rig);
  var mirror = new THREE.Group(); rig.add(mirror);
  var face = new THREE.Group(); face.scale.set(1, 1.3, 1);
  var ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 24, seg), gold);
  var inner = new THREE.Mesh(new THREE.TorusGeometry(0.965, 0.022, 12, seg),
    new THREE.MeshBasicMaterial({ color: 0xf0e2b4, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  inner.position.z = 0.03;
  var glass = new THREE.Mesh(new THREE.CircleGeometry(0.97, seg), new THREE.MeshBasicMaterial({ map: glassTex }));
  glass.position.z = 0.01;
  var glint = new THREE.Mesh(new THREE.CircleGeometry(0.97, seg),
    new THREE.MeshBasicMaterial({ map: glintTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glint.position.z = 0.02;
  var back = new THREE.Mesh(new THREE.CircleGeometry(1.0, seg),
    new THREE.MeshStandardMaterial({ map: backTex, metalness: 0.7, roughness: 0.35, envMap: envMap, envMapIntensity: 0.9 }));
  back.position.z = -0.03; back.rotation.y = Math.PI;
  face.add(ring, inner, glass, glint, back);

  // beaded rim, like an antique vanity mirror
  var nBeads = small ? 36 : 56;
  var beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 14, 10), bead, nBeads);
  var m4 = new THREE.Matrix4();
  for (var i = 0; i < nBeads; i++) {
    var a = i / nBeads * Math.PI * 2;
    m4.makeTranslation(Math.cos(a) * 1.17, Math.sin(a) * 1.3 * 1.17, 0);
    beads.setMatrixAt(i, m4);
  }

  // turned handle: lathe profile with bead rings, jewel end cap
  var prof = [];
  var rings = [-0.12, -0.55, -0.95, -1.4];
  for (var k = 0; k <= 90; k++) {
    var y = -1.6 * k / 90, r = 0.085 + 0.05 * (-y / 1.6);
    rings.forEach(function (c) { r += 0.06 * Math.exp(-Math.pow((y - c) / 0.045, 2)); });
    prof.push(new THREE.Vector2(r, y));
  }
  var handle = new THREE.Mesh(new THREE.LatheGeometry(prof, small ? 20 : 36), gold);
  handle.position.y = -1.38;
  var gem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1),
    new THREE.MeshStandardMaterial({ color: 0x6f9a6a, metalness: 0.35, roughness: 0.08, envMap: envMap, envMapIntensity: 1.6, flatShading: true }));
  gem.scale.set(1, 1.35, 1); gem.position.y = -1.38 - 1.6 - 0.14;
  mirror.add(face, beads, handle, gem);

  // soft light pool under the mirror
  var glowTex = canvasTex(256, 256, function (g, w, h) {
    var r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, "rgba(176,141,74,.5)"); r.addColorStop(0.5, "rgba(170,196,150,.28)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
  var pool = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false })); // normal blend: additive glow vanishes on a white page
  pool.rotation.x = -Math.PI / 2; pool.position.y = -3.7;
  rig.add(pool);

  // sparkles
  var starTex = canvasTex(64, 64, function (g, w, h) {
    var r = g.createRadialGradient(32, 32, 0, 32, 32, 6); r.addColorStop(0, "#fff"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,.9)"; g.fillRect(31, 4, 2, 56); g.fillRect(4, 31, 56, 2);
  });
  function sparkles(n, seed) {
    var pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var a = (i * 2.399 + seed) % 6.283, rr = 1.7 + ((i * 7 + seed * 3) % 10) / 10 * 1.3;
      pos[i * 3] = Math.cos(a) * rr * 0.9; pos[i * 3 + 1] = Math.sin(a * 1.3) * rr * 1.3 - 0.6; pos[i * 3 + 2] = ((i * 5) % 7 - 3) * 0.3;
    }
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ map: starTex, size: 0.32, transparent: true, depthWrite: false,
      color: 0xb89a4c }));
  }
  var spA = sparkles(small ? 10 : 18, 0), spB = sparkles(small ? 10 : 18, 2.1);
  rig.add(spA, spB);

  // gold orbiters: tilted rings and floating gems that circle the mirror
  var orb = new THREE.Group(); rig.add(orb);
  var orbGold = new THREE.MeshStandardMaterial({ color: 0xb59656, metalness: 1, roughness: 0.26, envMap: envMap, envMapIntensity: 1.05 });
  [[2.05, 0.9, 0.2], [2.45, -0.7, 0.9]].forEach(function (d) {
    var rg = new THREE.Mesh(new THREE.TorusGeometry(d[0], 0.022, 10, small ? 64 : 120), orbGold);
    rg.rotation.x = Math.PI / 2 + d[1]; rg.rotation.y = d[2]; orb.add(rg);
  });
  var gems = [];
  for (var gi = 0; gi < (small ? 5 : 8); gi++) {
    var gm = new THREE.Mesh(new THREE.OctahedronGeometry(0.1 + (gi % 3) * 0.035, 0),
      gi % 3 === 1 ? new THREE.MeshStandardMaterial({ color: 0x86ad7c, metalness: 0.4, roughness: 0.1, envMap: envMap, envMapIntensity: 1.4, flatShading: true }) : orbGold);
    gm.userData = { a: gi / (small ? 5 : 8) * Math.PI * 2, r: 2.0 + (gi % 3) * 0.25, y: ((gi * 37) % 10 - 5) * 0.2, sp: 0.25 + (gi % 4) * 0.06 };
    orb.add(gm); gems.push(gm);
  }

  // ---- input: mouse or phone tilt, both give nx, ny in [-1, 1]
  var nx = 0, ny = 0, tx = 0, ty = 0, tiltOn = false;
  window.addEventListener("pointermove", function (e) {
    if (tiltOn) return;
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  function onTilt(e) {
    if (e.gamma == null) return;
    tiltOn = true;
    tx = Math.max(-1, Math.min(1, e.gamma / 30));
    ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  }
  var tiltBtn = hero.querySelector(".tilt-btn");
  var touch = window.matchMedia("(pointer: coarse)").matches;
  if (tiltBtn && touch && window.DeviceOrientationEvent) {
    var DOE = window.DeviceOrientationEvent;
    if (typeof DOE.requestPermission === "function") {
      tiltBtn.hidden = false; // iOS needs one tap
      tiltBtn.addEventListener("click", function () {
        DOE.requestPermission().then(function (r) {
          if (r === "granted") window.addEventListener("deviceorientation", onTilt);
          tiltBtn.hidden = true;
        }).catch(function () { tiltBtn.hidden = true; });
      });
    } else if (touch) {
      window.addEventListener("deviceorientation", onTilt);
    }
  }

  // ---- layout: wordmark left + mirror right on wide screens; wordmark top + mirror below on tall ones
  var L = { x: 0, y: 0.7, s: 0.85 };
  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    var halfW = START_Z * Math.tan(19 * Math.PI / 180) * camera.aspect;
    if (w >= 760 && w / h >= 1.05) { L.x = halfW * 0.5; L.y = 0.7; L.s = 0.85; hero.classList.remove("tall"); }
    else {
      // header sits above the stage at scroll 0, so fit the mirror in what is actually visible
      var vis = Math.max(0.6, Math.min(1, (window.innerHeight - hero.offsetTop) / h));
      L.x = 0; L.y = -0.45 + (1 - vis) * 2.6; L.s = Math.min(0.5, halfW / 1.7) * (0.65 + 0.35 * vis); hero.classList.add("tall");
    }
  }
  window.addEventListener("resize", function () { small = window.innerWidth < 700; resize(); });
  resize();

  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }
  function progress() {
    if (reduce) return 0;
    var r = hero.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    return span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
  }

  var visible = true, t0 = performance.now();
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !reduce) loop(); }).observe(hero);

  var spinAt = 6, SPIN = 3.4, PERIOD = 15; // back of the mirror shows every so often

  function frame(now) {
    var t = (now - t0) / 1000;
    var p = progress();
    var dive = ease(p / 0.6);
    var intro = reduce ? 1 : ease(t / 2.6);
    nx += (tx - nx) * 0.06; ny += (ty - ny) * 0.06;
    var calm = 1 - dive; // tilt and layout fade as we fly in

    var spin = 0;
    if (!reduce && t > spinAt) {
      var u = ((t - spinAt) % PERIOD) / SPIN;
      if (u < 1) spin = (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2) * Math.PI * 2;
    }
    rig.position.x = L.x * calm;
    rig.position.y = (L.y + (1 - intro) * -4) * calm;
    rig.scale.setScalar(L.s * (0.55 + 0.45 * intro));
    mirror.rotation.y = (Math.sin(t * 0.45) * 0.4 + nx * 0.5 + spin + (1 - intro) * Math.PI * 2) * calm;
    mirror.rotation.x = (ny * 0.3 + Math.sin(t * 0.6) * 0.04) * calm;
    mirror.rotation.z = Math.sin(t * 0.35) * 0.05 * calm;
    mirror.position.y = Math.sin(t * 0.9) * 0.12 * calm;
    pool.material.opacity = 0.55 + Math.sin(t * 0.9) * 0.1;
    pool.visible = calm > 0.05;
    spA.material.opacity = 0.5 + 0.5 * Math.sin(t * 1.7);
    spB.material.opacity = 0.5 + 0.5 * Math.sin(t * 1.7 + 3.14);
    spA.rotation.y = t * 0.08; spB.rotation.y = -t * 0.06;
    spA.visible = spB.visible = calm > 0.05;
    orb.visible = calm > 0.05;
    orb.rotation.y = t * 0.12; orb.rotation.x = nx * 0.15; orb.rotation.z = ny * 0.1;
    gems.forEach(function (gm, k) {
      var u = gm.userData, a = u.a + t * u.sp;
      gm.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * 0.8 + k) * 0.12, Math.sin(a) * u.r);
      gm.rotation.x = t * 0.9 + k; gm.rotation.y = t * 0.7;
    });
    camera.position.z = START_Z + (END_Z - START_Z) * dive;
    lamp.position.set(nx * 3.8, -ny * 2.6, 3);
    glassTex.offset.set(0.09 + nx * 0.06, 0.09 - ny * 0.06);
    glintTex.offset.x = -0.5 + ((Math.sin(t * 0.7) + nx * 1.2) * 0.35);
    renderer.render(scene, camera);

    // page layers driven by scroll
    var chrome = 1 - ease(p / 0.3);
    mark.style.opacity = chrome;
    mark.style.transform = "scale(" + (1 + (1 - chrome) * 0.25) + ")";
    if (cue) cue.style.opacity = 1 - ease(p / 0.08);
    flash.style.opacity = ease((p - 0.5) / 0.28);
    canvas.style.opacity = 1 - ease((p - 0.78) / 0.1);
    // past the flash the other side plays its own timed spin; a gap between the two thresholds stops flicker
    if (p > 0.8) other.classList.add("on"); else if (p < 0.72) other.classList.remove("on");
    mark.style.setProperty("--shine", (50 + nx * 35) + "%");
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
  if (reduce) { other.classList.add("on"); frame(performance.now()); } else { loop(); }
})();
