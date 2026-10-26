// Swatch ring: a 3D ring of hair-color swatches. Drag or tap to spin; the shade at the front picks a gallery filter.
// Needs THREE (cdnjs r128), window.GALLERY and window.__galleryFilter (set by site.js). The shade buttons below the ring
// work without WebGL and are the keyboard route.
(function () {
  var root = document.getElementById("shades");
  if (!root) return;
  var SHADES = [
    { name: "Platinum",       root: "#d9d2c0", tip: "#f6f1e6", tag: "Blonde" },
    { name: "Ash blonde",     root: "#a39880", tip: "#dcd2bc", tag: "Blonde" },
    { name: "Champagne",      root: "#bda57a", tip: "#ecd9ae", tag: "Blonde" },
    { name: "Honey",          root: "#a87634", tip: "#e2bb6a", tag: "Blonde" },
    { name: "Golden caramel", root: "#8c5c2a", tip: "#d29c52", tag: "Highlights" },
    { name: "Copper",         root: "#7d3716", tip: "#d4733a", tag: "Red" },
    { name: "Auburn",         root: "#5c2418", tip: "#a24428", tag: "Red" },
    { name: "Chestnut",       root: "#42261a", tip: "#865636", tag: "Brunette" },
    { name: "Mocha",          root: "#33201a", tip: "#664430", tag: "Brunette" },
    { name: "Espresso",       root: "#1c130f", tip: "#47301f", tag: "Brunette" },
    { name: "Violet",         root: "#34204a", tip: "#8460ac", tag: "Vivid color" }
  ];
  var N = SHADES.length, STEP = Math.PI * 2 / N;
  function count(tag) { return (window.GALLERY || []).filter(function (g) { return g.src && (g.tags || []).indexOf(tag) >= 0; }).length; }

  var nameEl = root.querySelector(".shade-name"), cntEl = root.querySelector(".shade-count"), goBtn = root.querySelector(".shade-go");
  var listEl = root.querySelector(".shade-list"), prevB = root.querySelector(".shade-prev"), nextB = root.querySelector(".shade-next");
  var cur = 3, idle = true; // honey

  function show(i, fromUser) {
    if (fromUser) idle = false;
    cur = (i + N) % N;
    var s = SHADES[cur], c = count(s.tag);
    nameEl.textContent = s.name;
    cntEl.textContent = c + (c === 1 ? " photo" : " photos") + " tagged " + s.tag;
    goBtn.textContent = "Show these photos";
    listEl.querySelectorAll("button").forEach(function (b, k) { b.setAttribute("aria-pressed", k === cur); });
    target = -cur * STEP;
  }
  var target = 0;

  // plain buttons: work without WebGL
  listEl.innerHTML = SHADES.map(function (s, k) {
    return '<button type="button" data-i="' + k + '" aria-pressed="false"><span class="dot" style="background:linear-gradient(' + s.root + ',' + s.tip + ')"></span>' + s.name + '</button>';
  }).join("");
  listEl.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) show(+b.dataset.i, true); });
  prevB.addEventListener("click", function () { show(cur - 1, true); });
  nextB.addEventListener("click", function () { show(cur + 1, true); });
  goBtn.addEventListener("click", function () {
    var s = SHADES[cur];
    if (window.__galleryFilter) window.__galleryFilter(s.tag);
    var g = document.getElementById("gchips"); if (g) g.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  var canvas = root.querySelector("canvas");
  if (!window.THREE || !canvas) { root.classList.add("no3d"); show(cur); return; }
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true }); }
  catch (e) { root.classList.add("no3d"); show(cur); return; }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.innerWidth < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0, 1.4, 11.5); camera.lookAt(0, -0.35, 0);
  scene.add(new THREE.AmbientLight(0xfff3dc, 0.5));
  var key = new THREE.DirectionalLight(0xffffff, 0.5); key.position.set(3, 6, 8); scene.add(key);
  var fill = new THREE.PointLight(0xc4d3b0, 0.35, 40); fill.position.set(-6, 2, 6); scene.add(fill);

  function tex(s) {
    var c = document.createElement("canvas"); c.width = 128; c.height = 512; var g = c.getContext("2d");
    var gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, s.root); gr.addColorStop(1, s.tip);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 512);
    for (var i = 0; i < 120; i++) { // fine strands
      var x = Math.random() * 128, a = 0.05 + Math.random() * 0.1;
      g.strokeStyle = (i % 2 ? "rgba(255,255,255," : "rgba(0,0,0,") + a + ")"; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, 40); g.bezierCurveTo(x + (Math.random() - .5) * 6, 200, x + (Math.random() - .5) * 8, 360, x + (Math.random() - .5) * 10, 512); g.stroke();
    }
    var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  }

  var R = 3.0, LEN = 2.7, ring = new THREE.Group(); scene.add(ring);
  var swatches = [];
  var brass = new THREE.MeshStandardMaterial({ color: 0xb59656, metalness: 0.9, roughness: 0.3 });
  var band = new THREE.MeshStandardMaterial({ color: 0x1e1a14, roughness: 0.6 });
  SHADES.forEach(function (s, k) {
    var geo = new THREE.PlaneGeometry(1.1, LEN, 1, 28);
    var p = geo.attributes.position;
    for (var v = 0; v < p.count; v++) { // taper toward the tip and curl slightly
      var y = p.getY(v), u = (LEN / 2 - y) / LEN;                 // 0 at the root, 1 at the tip
      p.setX(v, p.getX(v) * (1 - 0.34 * u));
      p.setZ(v, 0.12 * Math.sin(u * 3.1) - 0.1 * u * u);
    }
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex(s), side: THREE.DoubleSide, roughness: 0.7, metalness: 0.0 }));
    var holder = new THREE.Group();
    m.position.y = -LEN / 2 - 0.1; holder.add(m);
    var bd = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.3, 0.22), band); bd.position.y = -0.12; holder.add(bd);
    var a = k * STEP;
    holder.position.set(Math.sin(a) * R, 1.1, Math.cos(a) * R);
    holder.rotation.y = a;
    holder.userData = { k: k, mesh: m };
    ring.add(holder); swatches.push(holder);
  });
  var rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.06, 14, 120), brass);
  rim.rotation.x = Math.PI / 2; rim.position.y = 1.15; ring.add(rim);
  var rim2 = rim.clone(); rim2.scale.set(0.985, 0.985, 1); rim2.position.y = 1.05; ring.add(rim2);
  var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16), brass); hub.position.y = 1.3; ring.add(hub);
  var shadow = new THREE.Mesh(new THREE.CircleGeometry(R * 1.1, 48), new THREE.MeshBasicMaterial({ color: 0x6a7a58, transparent: true, opacity: 0.12 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.9; scene.add(shadow);

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w / h < 1.2 ? 13.4 : 11.5; camera.lookAt(0, -0.35, 0); camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize); resize();

  // interaction: drag to spin, release to snap to the nearest shade, tap a swatch to bring it forward
  var rot = 0, drag = null, moved = 0, lastT = performance.now(); if (reduce) idle = false;
  var ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  function pick(e) {
    var r = canvas.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    var hit = ray.intersectObjects(swatches.map(function (h) { return h.userData.mesh; }));
    return hit.length ? hit[0].object.parent.userData.k : -1;
  }
  canvas.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, rot: rot }; moved = 0; idle = false; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", function (e) {
    if (drag) { var dx = e.clientX - drag.x; moved = Math.max(moved, Math.abs(dx)); rot = drag.rot + dx * 0.008; }
    else canvas.style.cursor = pick(e) >= 0 ? "pointer" : "grab";
  });
  function release(e) {
    if (!drag) return;
    if (moved < 6) { var k = pick(e); if (k >= 0) show(k, true); }
    else { show(Math.round(-rot / STEP), true); }
    drag = null;
  }
  canvas.addEventListener("pointerup", release); canvas.addEventListener("pointercancel", function () { drag = null; });
  canvas.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") { show(cur - 1, true); e.preventDefault(); } if (e.key === "ArrowRight") { show(cur + 1, true); e.preventDefault(); } });

  var visible = true, running = false;
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }).observe(canvas);
  function frame(now) {
    var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    if (!drag) {
      if (idle) { rot -= dt * 0.12; } // slow idle spin until the visitor touches it
      else { var d = target - rot; d = ((d + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; rot += d * Math.min(1, dt * 6); }
    }
    ring.rotation.y = rot;
    var front = ((-rot / STEP) % N + N) % N;
    swatches.forEach(function (h) {
      var k = h.userData.k, dist = Math.abs(((k - front + N / 2) % N + N) % N - N / 2);
      var lift = Math.max(0, 1 - dist) ;
      h.position.y += (1.1 + lift * 0.3 - h.position.y) * 0.15;
      var sc = 1 + lift * 0.12; h.scale.setScalar(sc);
    });
    if (idle) { var f = Math.round(front) % N; if (f !== cur) { cur = f; nameEl.textContent = SHADES[f].name; var c = count(SHADES[f].tag); cntEl.textContent = c + (c === 1 ? " photo" : " photos") + " tagged " + SHADES[f].tag; listEl.querySelectorAll("button").forEach(function (b, kk) { b.setAttribute("aria-pressed", kk === f); }); } }
    renderer.render(scene, camera);
  }
  function loop() {
    if (running) return; running = true;
    (function tick(now) { if (!visible) { running = false; return; } frame(now); requestAnimationFrame(tick); })(performance.now());
  }
  show(cur); rot = target;
  loop();
})();
