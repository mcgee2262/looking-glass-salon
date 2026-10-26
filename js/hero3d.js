// Hero: 3D hand mirror + scroll "through the looking glass" portal.
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
  var START_Z = 8.2, END_Z = 0.55;
  camera.position.set(0, 0, START_Z);

  // lights: plum and rose-gold
  scene.add(new THREE.AmbientLight(0xffe7ee, 0.55));
  var rose = new THREE.PointLight(0xffb59e, 1.6, 30); rose.position.set(3, 3, 5); scene.add(rose);
  var plum = new THREE.PointLight(0x9b4b86, 1.8, 30); plum.position.set(-4, -2, 4); scene.add(plum);

  function canvasTex(w, h, draw) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }

  // fake reflection on the glass: plum to rose gold to cream, soft blobs
  var glassTex = canvasTex(512, 512, function (g, w, h) {
    var lin = g.createLinearGradient(0, 0, w, h);
    lin.addColorStop(0, "#2a1226"); lin.addColorStop(0.45, "#8a4b62");
    lin.addColorStop(0.75, "#e9a9a0"); lin.addColorStop(1, "#fff0e8");
    g.fillStyle = lin; g.fillRect(0, 0, w, h);
    [[130, 150, 150, "rgba(255,200,190,.55)"], [380, 330, 170, "rgba(120,50,120,.55)"],
     [300, 90, 110, "rgba(255,240,230,.45)"]].forEach(function (b) {
      var r = g.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
      r.addColorStop(0, b[3]); r.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = r; g.fillRect(0, 0, w, h);
    });
  });
  glassTex.repeat.set(0.8, 0.8);

  // moving glint band
  var glintTex = canvasTex(256, 256, function (g, w, h) {
    var l = g.createLinearGradient(0, 0, w, 0);
    l.addColorStop(0.35, "rgba(255,255,255,0)"); l.addColorStop(0.5, "rgba(255,255,255,.85)");
    l.addColorStop(0.65, "rgba(255,255,255,0)");
    g.fillStyle = l; g.fillRect(0, 0, w, h);
  });
  glintTex.wrapS = THREE.RepeatWrapping; glintTex.repeat.set(1, 1);

  var seg = small ? 48 : 96;
  var metal = new THREE.MeshStandardMaterial({ color: 0xc98a86, metalness: 0.75, roughness: 0.28 });
  var mirror = new THREE.Group();
  var face = new THREE.Group(); face.scale.set(1, 1.3, 1);
  var ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 24, seg), metal);
  var glass = new THREE.Mesh(new THREE.CircleGeometry(0.97, seg), new THREE.MeshBasicMaterial({ map: glassTex }));
  glass.position.z = 0.01;
  var glint = new THREE.Mesh(new THREE.CircleGeometry(0.97, seg),
    new THREE.MeshBasicMaterial({ map: glintTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glint.position.z = 0.02;
  face.add(ring, glass, glint);
  var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 1.5, 24), metal);
  handle.position.y = -(1.3 + 0.78);
  var cap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), metal);
  cap.position.y = -(1.3 + 1.55);
  var collar = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 12, 24), metal);
  collar.rotation.x = Math.PI / 2; collar.position.y = -(1.3 + 0.1);
  mirror.add(face, handle, cap, collar);
  scene.add(mirror);

  // input: mouse or phone tilt, both give nx, ny in [-1, 1]
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

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    mirror.scale.setScalar(small || w < h ? 0.7 : 0.8);
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

  function frame(now) {
    var t = (now - t0) / 1000;
    var p = progress();
    var dive = ease(p / 0.6);
    nx += (tx - nx) * 0.06; ny += (ty - ny) * 0.06;
    var calm = 1 - dive; // tilt fades as we fly in
    mirror.rotation.y = (Math.sin(t * 0.45) * 0.45 + nx * 0.5) * calm;
    mirror.rotation.x = (ny * 0.3 + Math.sin(t * 0.6) * 0.04) * calm;
    mirror.rotation.z = Math.sin(t * 0.35) * 0.05 * calm;
    mirror.position.y = (Math.sin(t * 0.9) * 0.12 + 0.95) * calm;
    camera.position.z = START_Z + (END_Z - START_Z) * dive;
    glassTex.offset.set(nx * 0.12 + t * 0.01, -ny * 0.12);
    glintTex.offset.x = -0.5 + ((Math.sin(t * 0.7) + nx * 1.2) * 0.35);
    renderer.render(scene, camera);

    // page layers driven by scroll
    var chrome = 1 - ease(p / 0.3);
    mark.style.opacity = chrome;
    mark.style.transform = "scale(" + (1 + (1 - chrome) * 0.25) + ")";
    if (cue) cue.style.opacity = 1 - ease(p / 0.08);
    var f = ease((p - 0.5) / 0.28);
    flash.style.opacity = f;
    canvas.style.opacity = 1 - ease((p - 0.78) / 0.1);
    var o = ease((p - 0.8) / 0.18);
    other.style.opacity = o;
    other.style.setProperty("--flip", String(1 - 2 * (1 - o))); // -1 mirrored to 1 correct
    other.style.pointerEvents = o > 0.5 ? "auto" : "none";
    // wordmark shine follows tilt
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
  if (reduce) { frame(performance.now()); } else { loop(); }
})();
