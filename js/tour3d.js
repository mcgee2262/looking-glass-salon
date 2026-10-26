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
    { title: "Shampoo bowls",    text: "Two bowls under a shelf, just off the main floor.",                            photo: "assets/studio/studio-4.jpg", cam: [3.0, 1.6, 0.8],    look: [6.5, 1.0, -0.4] },
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
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); } catch (e) { root.classList.add("no3d"); return; }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.innerWidth < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef0e4);
  scene.fog = new THREE.Fog(0xeef0e4, 14, 30);
  var camera = new THREE.PerspectiveCamera(62, 1, 0.1, 60);

  // ---- materials
  function M(color, rough, metal) { return new THREE.MeshStandardMaterial({ color: color, roughness: rough == null ? 0.8 : rough, metalness: metal || 0 }); }
  var sage = M(0xb7c4a4), sageDark = M(0x93a683), cream = M(0xf3eedd), black = M(0x1d1c1a, 0.5), oak = M(0xd7bd92, 0.7), white = M(0xf8f6ef, 0.4),
      brass = M(0xb59656, 0.3, 0.9), navy = M(0x2f3a46, 0.9), leaf = M(0x6f8c5a), rugM = M(0xe9e1cc), grey = M(0x8f918a, 0.6);
  function box(w, h, d, mat, x, y, z) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); scene.add(m); return m; }
  function cyl(rt, rb, h, mat, x, y, z, seg) { var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 24), mat); m.position.set(x, y, z); scene.add(m); return m; }

  // floor: oak planks drawn on a canvas
  var fc = document.createElement("canvas"); fc.width = 512; fc.height = 512; var g = fc.getContext("2d");
  for (var i = 0; i < 8; i++) {
    g.fillStyle = ["#d9bf94", "#d2b78b", "#dec59b", "#cfb387"][i % 4]; g.fillRect(0, i * 64, 512, 64);
    g.strokeStyle = "rgba(90,60,30,.25)"; g.lineWidth = 2; g.strokeRect(0, i * 64, 512, 64);
    for (var j = 0; j < 4; j++) { g.beginPath(); g.moveTo((j * 131 + i * 53) % 512, i * 64); g.lineTo((j * 131 + i * 53) % 512, i * 64 + 64); g.stroke(); }
  }
  var ft = new THREE.CanvasTexture(fc); ft.encoding = THREE.sRGBEncoding; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(3, 2.2);
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.65 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 0.25); scene.add(floor);

  // room shell
  box(14, 3.4, 0.2, sage, 0, 1.7, -5.1);           // back wall
  box(0.2, 3.4, 11, sage, -7.1, 1.7, 0.25);        // left wall (windows)
  box(0.2, 3.4, 11, cream, 7.1, 1.7, 0.25);        // right wall
  box(14, 3.4, 0.2, cream, 0, 1.7, 5.7);           // front wall
  box(14, 0.15, 11, white, 0, 3.4, 0.25);          // ceiling
  for (var t = -5; t <= 5; t += 5) box(0.08, 0.06, 9, grey, t, 3.3, 0.2); // ceiling tracks
  // windows (soft glowing panes) on the left wall
  [-3.2, 0.2, 3.4].forEach(function (z) {
    var w = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.9), new THREE.MeshBasicMaterial({ color: 0xfbfff2 }));
    w.rotation.y = Math.PI / 2; w.position.set(-6.98, 1.75, z); scene.add(w);
    box(0.06, 2.0, 0.06, black, -6.95, 1.75, z - 1.22); box(0.06, 2.0, 0.06, black, -6.95, 1.75, z + 1.22);
  });

  // two styling stations on the back wall: counter, round brass mirror, black chair
  [-4.6, -1.6].forEach(function (x) {
    box(2.3, 0.9, 0.55, oak, x, 0.45, -4.75);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 14, 48), brass); rim.position.set(x, 1.85, -4.95); scene.add(rim);
    var glass = new THREE.Mesh(new THREE.CircleGeometry(0.6, 40), new THREE.MeshStandardMaterial({ color: 0xe7efe9, roughness: 0.05, metalness: 0.6 })); glass.position.set(x, 1.85, -4.94); scene.add(glass);
    cyl(0.32, 0.32, 0.05, black, x, 0.55, -3.5); cyl(0.07, 0.07, 0.5, grey, x, 0.28, -3.5, 12); cyl(0.3, 0.3, 0.04, black, x, 0.03, -3.5);
    box(0.6, 0.1, 0.6, black, x, 0.62, -3.5); box(0.6, 0.7, 0.1, black, x, 1.0, -3.2);
    cyl(0.2, 0.2, 0.01, black, x, 0.02, -3.5);
  });
  // shelf on the back wall
  box(2.2, 0.06, 0.28, oak, 1.6, 1.5, -4.9); cyl(0.12, 0.1, 0.3, cream, 1.2, 1.68, -4.9); cyl(0.1, 0.1, 0.22, brass, 1.9, 1.64, -4.9);

  // shampoo bowls on the right wall
  [-1.4, 0.4].forEach(function (z) {
    box(1.0, 0.95, 0.9, oak, 6.4, 0.475, z); cyl(0.38, 0.3, 0.2, white, 6.25, 1.0, z);
    box(0.7, 0.14, 0.7, black, 5.0, 0.62, z); box(0.1, 0.7, 0.6, black, 4.65, 0.95, z); cyl(0.07, 0.07, 0.5, grey, 5.0, 0.3, z, 12);
  });
  box(2.8, 0.06, 0.3, oak, 6.9, 1.8, -0.5);

  // lounge corner: rug, two armchairs, a small table, a hooded dryer
  var rug = new THREE.Mesh(new THREE.CircleGeometry(1.9, 48), rugM); rug.rotation.x = -Math.PI / 2; rug.position.set(-4.4, 0.012, 3.0); scene.add(rug);
  var rugRing = new THREE.Mesh(new THREE.RingGeometry(1.45, 1.6, 48), M(0xb7c4a4)); rugRing.rotation.x = -Math.PI / 2; rugRing.position.set(-4.4, 0.016, 3.0); scene.add(rugRing);
  [[-5.4, 3.7, 0.5], [-3.3, 3.8, -0.5]].forEach(function (a) {
    box(0.9, 0.4, 0.9, navy, a[0], 0.3, a[1]).rotation.y = a[2]; box(0.9, 0.7, 0.18, navy, a[0] - Math.sin(a[2]) * 0.4, 0.75, a[1] - Math.cos(a[2]) * 0.4).rotation.y = a[2];
    [[-.35, -.35], [.35, -.35], [-.35, .35], [.35, .35]].forEach(function (o) { cyl(0.04, 0.04, 0.12, brass, a[0] + o[0], 0.06, a[1] + o[1], 8); });
  });
  cyl(0.32, 0.32, 0.04, brass, -4.4, 0.52, 3.1); cyl(0.05, 0.05, 0.5, brass, -4.4, 0.27, 3.1, 10);
  cyl(0.04, 0.04, 1.4, grey, -6.4, 0.7, 1.2, 10); var dome = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.6), white); dome.position.set(-6.4, 1.5, 1.2); scene.add(dome);
  box(1.4, 0.05, 0.1, brass, -4.6, 1.9, 5.55); [-5.1, -4.6, -4.1].forEach(function (x) { cyl(0.03, 0.03, 0.2, black, x, 1.8, 5.5, 8); });

  // reception desk and plants
  box(3.0, 1.05, 0.75, oak, 4.3, 0.525, 3.6); box(3.1, 0.06, 0.85, white, 4.3, 1.08, 3.6); cyl(0.2, 0.2, 0.05, black, 3.6, 0.68, 4.5); cyl(0.05, 0.05, 0.6, grey, 3.6, 0.35, 4.5, 8);
  [[-6.4, -4.4], [6.3, 4.8], [-6.3, 5.0]].forEach(function (p) {
    cyl(0.25, 0.2, 0.45, cream, p[0], 0.22, p[1]);
    for (var q = 0; q < 5; q++) { var lf = new THREE.Mesh(new THREE.SphereGeometry(0.22 + (q % 2) * 0.06, 12, 10), leaf); lf.position.set(p[0] + Math.sin(q * 1.9) * 0.16, 0.7 + q * 0.14, p[1] + Math.cos(q * 1.9) * 0.16); scene.add(lf); }
  });

  // lights
  scene.add(new THREE.HemisphereLight(0xfffbea, 0xb9c3a2, 0.75));
  var sun = new THREE.DirectionalLight(0xfff6df, 0.45); sun.position.set(-8, 6, 2); scene.add(sun);
  [[-3, 3, -1], [3, 3, 0], [-3, 3, 3.5]].forEach(function (p) { var l = new THREE.PointLight(0xfff0d0, 0.35, 12); l.position.set(p[0], p[1], p[2]); scene.add(l); });

  // ---- camera: glide between stops, drag to look around
  var pos = new THREE.Vector3().fromArray(STOPS[0].cam), look = new THREE.Vector3().fromArray(STOPS[0].look);
  var fromP = pos.clone(), fromL = look.clone(), toP = pos.clone(), toL = look.clone(), t0 = 0, dur = 2200;
  var yaw = 0, pitch = 0, tyaw = 0, tpitch = 0, drag = null, active = false;
  api.fly = function (i) {
    fromP.copy(pos); fromL.copy(look); toP.fromArray(STOPS[i].cam); toL.fromArray(STOPS[i].look); tyaw = 0; tpitch = 0;
    if (reduce) { pos.copy(toP); look.copy(toL); yaw = pitch = 0; render(); } else t0 = performance.now();
  };
  function resize() { var w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 1 ? 75 : 62; camera.updateProjectionMatrix(); render(); }
  window.addEventListener("resize", resize);
  canvas.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, yaw: tyaw, pitch: tpitch }; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", function (e) { if (!drag) return; tyaw = Math.max(-1.1, Math.min(1.1, drag.yaw + (e.clientX - drag.x) * 0.005)); tpitch = Math.max(-0.5, Math.min(0.5, drag.pitch + (e.clientY - drag.y) * 0.004)); });
  function up() { drag = null; canvas.style.cursor = "grab"; }
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);

  var tmp = new THREE.Vector3(), dir = new THREE.Vector3();
  function render() {
    var now = performance.now(), u = t0 ? Math.min(1, (now - t0) / dur) : 1, e = u * u * (3 - 2 * u);
    pos.lerpVectors(fromP, toP, e); look.lerpVectors(fromL, toL, e);
    yaw += (tyaw - yaw) * 0.12; pitch += (tpitch - pitch) * 0.12;
    dir.subVectors(look, pos);
    var len = dir.length(), a = Math.atan2(dir.x, dir.z) + yaw, p = Math.asin(dir.y / len) + pitch;
    tmp.set(pos.x + Math.sin(a) * Math.cos(p) * len, pos.y + Math.sin(p) * len, pos.z + Math.cos(a) * Math.cos(p) * len);
    camera.position.set(pos.x, pos.y + (reduce ? 0 : Math.sin(now / 900) * 0.015 * (1 - 0)), pos.z); camera.lookAt(tmp);
    renderer.render(scene, camera);
  }
  var visible = false, running = false;
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }).observe(canvas);
  function loop() { if (running) return; running = true; (function tick() { if (!visible) { running = false; return; } render(); requestAnimationFrame(tick); })(); }
  resize(); render();
})();
