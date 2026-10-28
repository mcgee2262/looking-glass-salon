(function () {
  var calm0 = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!calm0 && "IntersectionObserver" in window) document.documentElement.classList.add("js");
  var S = window.SALON, page = document.body.dataset.page;
  var nav = [["index.html","Home"],["services.html","Services"],["gallery.html","Gallery"],["about.html","About"],["visit.html","Visit"]];
  function esc(t){var d=document.createElement("div");d.textContent=t;return d.innerHTML;}
  // Owner-only draft bar: add ?preview to any page link. It sticks for the tab; ?preview=off clears it.
  function isPreview(){
    try {
      var q = /[?&]preview(=([^&]*))?/.exec(location.search);
      if (q) { if (q[2] === "off") sessionStorage.removeItem("lgPreview"); else sessionStorage.setItem("lgPreview", "1"); }
      return sessionStorage.getItem("lgPreview") === "1";
    } catch (e) { return !!/[?&]preview(?!=off)/.test(location.search); }
  }
  var tbc = '<span class="tbc">To be confirmed</span>';

  document.getElementById("site-header").innerHTML =
    '<a class="skip" href="#main">Skip to content</a>' +
    '<div class="bar"><a class="brand" href="index.html"><img class="brand-mark" src="assets/logo.svg" alt="" width="30" height="46"><span class="brand-text">' + esc(S.name) + '<span class="brand-by">by ' + esc(S.owner.name) + '</span></span></a>' +
    '<button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>' +
    '<nav id="nav" aria-label="Main">' + nav.map(function(n){
      return '<a href="'+n[0]+'"'+(n[0].indexOf(page)===0?' aria-current="page"':'')+'>'+n[1]+'</a>';
    }).join("") + '</nav>' +
    '<a class="btn" href="'+S.bookingUrl+'">Book now</a></div>' +
    (isPreview() ? '<p class="review-banner">OWNER PREVIEW: content from the public GlossGenius page, awaiting owner review. Clients do not see this bar.</p>' : '');

  document.getElementById("site-footer").innerHTML =
    '<p><strong>' + esc(S.name) + '</strong> · ' + esc(S.owner.name) + ', ' + esc(S.owner.role.toLowerCase()) + ' · ' + (S.location.city ? esc(S.location.city) : tbc) + '</p>' +
    '<p><a href="'+S.bookingUrl+'">Book an appointment</a> <a class="old-site" href="'+S.oldSiteUrl+'" target="_blank" rel="noopener">Old website <span aria-hidden="true">\u2197</span></a></p>' +
    '<p class="fine">Still-life pictures of salon tools and products (shears, mirrors, clippers, hair wefts) are AI-generated brand art, not photos of the salon. Hair photos are Brandie\u2019s own work.</p>';

  // the bar stays pinned; it gets slimmer once the page is scrolled
  var bar = document.querySelector(".bar");
  function onBar() { bar.classList.toggle("is-scrolled", (window.scrollY || 0) > 30); }
  window.addEventListener("scroll", onBar, { passive: true }); onBar();
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { var nv = document.getElementById("nav"); if (nv.classList.contains("open")) { nv.classList.remove("open"); document.querySelector(".menu-btn").setAttribute("aria-expanded", "false"); } } });

  var btn = document.querySelector(".menu-btn"), n = document.getElementById("nav");
  btn.addEventListener("click", function(){
    var open = n.classList.toggle("open"); btn.setAttribute("aria-expanded", open);
  });

  document.querySelectorAll("[data-book]").forEach(function(a){
    a.href = S.bookingUrl;
  });

  var el = document.getElementById("services");
  if (el) {
    var chips = document.getElementById("chips");
    function card(s) {
      return '<article class="svc-card"><h3>' + esc(s.name) + '</h3>' +
        '<div class="svc-top"><span class="svc-price">' + esc(s.price || "") + '</span>' +
        (s.duration ? '<span class="svc-time">' + s.duration + ' min</span>' : '') +
        '<a class="svc-book" href="book.html?s=' + all.indexOf(s) + '" aria-label="Book ' + esc(s.name) + '">Book <span aria-hidden="true">\u2192</span></a></div>' +
        (s.desc ? '<p class="svc-desc">' + esc(s.desc) + '</p>' : '') + '</article>';
    }
    var all = [];
    window.SERVICES.forEach(function (g) { g.items.forEach(function (i) { i.cat = g.cat; all.push(i); }); });
    function show(cat, first) {
      el.innerHTML = '<div class="svc-grid">' + all.filter(function (i) { return cat === "All" || i.cat === cat; }).map(card).join("") + '</div>';
      if (!first) el.querySelectorAll(".rv").forEach(function (c) { c.classList.add("in", "done"); });
      if (chips) chips.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.cat === cat); });
    }
    if (chips) {
      chips.innerHTML = ["All"].concat(window.SERVICES.map(function (g) { return g.cat; })).map(function (c) {
        return '<button type="button" data-cat="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>';
      }).join("");
      chips.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) show(b.dataset.cat); });
    }
    show("All", true);
    el.addEventListener("keydown", function () {});
  }

  var gal = document.getElementById("gallery");
  if (gal) {
    var gchips = document.getElementById("gchips");
    var items = window.GALLERY;
    var tags = [];
    items.forEach(function (g) { (g.tags || []).forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); }); });
    var order = ["Blonde", "Brunette", "Red", "Highlights", "Bobs", "Extensions", "Process", "Before & After", "Braids", "Vivid color", "Kids"];
    tags.sort(function (a, b) { var x = order.indexOf(a), y = order.indexOf(b); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y); });
    var dlg = document.getElementById("lightbox"), cur = [], at = 0;
    function tile(g, i) {
      var cap = g.caption ? '<figcaption>' + esc(g.caption) + '</figcaption>' : '';
      var tg = esc((g.tags || []).join("|"));
      if (!g.src) {
        return '<figure class="rv" data-tags="' + tg + '"><div class="ph" role="img" aria-label="Photo coming soon"><strong>' + esc((g.tags || ["Photo"])[0]) + '</strong><span>Photo coming soon</span></div>' + cap + '</figure>';
      }
      return '<figure class="rv" data-tags="' + tg + '"><button type="button" class="tile" data-i="' + i + '" aria-label="Enlarge photo' +
        (g.caption ? ': ' + esc(g.caption.slice(0, 60)) : '') + '"><img src="' + esc(g.thumb || g.src) + '" alt="' + esc(g.alt) + '" loading="lazy" decoding="async"' + (g.pos ? ' style="object-position:' + esc(g.pos) + '"' : '') + '></button>' + cap + '</figure>';
    }
    function showGallery(tag) {
      cur = items.filter(function (g) { return tag === "All" || (g.tags || []).indexOf(tag) >= 0; });
      gal.innerHTML = cur.map(function (g) { return tile(g, items.indexOf(g)); }).join("");
      gal.querySelectorAll(".rv").forEach(function (f) { f.classList.add("in", "done"); });
      if (gchips) gchips.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.tag === tag); });
    }
    if (gchips) {
      gchips.innerHTML = ["All"].concat(tags).map(function (t) {
        return '<button type="button" data-tag="' + esc(t) + '" aria-pressed="false">' + esc(t) + '</button>';
      }).join("");
      gchips.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) showGallery(b.dataset.tag); });
    }
    showGallery("All");
    window.__galleryFilter = showGallery;

    // tap to enlarge: native dialog, Esc closes, arrow keys and buttons move between the photos shown
    function open(i) {
      var shown = cur.filter(function (g) { return g.src; });
      var g = items[i]; at = shown.indexOf(g);
      paint(shown);
      if (!dlg.open) dlg.showModal();
    }
    function paint(shown) {
      var g = shown[at];
      dlg.querySelector("img").src = g.src; dlg.querySelector("img").alt = g.alt || "";
      dlg.querySelector("figcaption").textContent = g.caption || "";
      dlg.querySelector(".nav").hidden = shown.length < 2;
    }
    function step(d) {
      var shown = cur.filter(function (g) { return g.src; });
      at = (at + d + shown.length) % shown.length; paint(shown);
    }
    gal.addEventListener("click", function (e) { var b = e.target.closest(".tile"); if (b) open(+b.dataset.i); });
    if (dlg) {
      dlg.querySelector(".close").addEventListener("click", function () { dlg.close(); });
      dlg.querySelector(".prev").addEventListener("click", function () { step(-1); });
      dlg.querySelector(".next").addEventListener("click", function () { step(1); });
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1);
      });
    }
  }

  // gold mirror emblem above the footer: stacked gold layers spin in real 3D
  var foot = document.getElementById("site-footer");
  if (foot) {
    var em = document.createElement("div"); em.className = "emblem"; em.setAttribute("aria-hidden", "true");
    var layers = "";
    for (var li = -4; li <= 4; li++) layers += '<i class="rim" style="transform:translateZ(' + li * 1.6 + 'px)"></i>';
    for (var lj = -3; lj <= 3; lj++) layers += '<i class="grip" style="transform:translateZ(' + lj * 1.4 + 'px)"></i>';
    em.innerHTML = '<div class="emb"><div class="emb-in">' + layers +
      '<i class="face" style="transform:translateZ(1px)"></i><i class="face" style="transform:rotateY(180deg) translateZ(1px)"></i></div></div>';
    foot.parentNode.insertBefore(em, foot);
  }

  // 3D tilt with a gold glare on cards, photos and tiles
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var TILT = ".svc-card,.fact,.pic,.tile";
    document.addEventListener("pointermove", function (e) {
      var c = e.target.closest && e.target.closest(TILT); if (!c) return;
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      var amp = r.width > 420 ? 5 : 10;
      c.style.transform = "perspective(800px) rotateY(" + ((x - .5) * amp) + "deg) rotateX(" + ((.5 - y) * amp) + "deg) translateZ(0)";
      c.style.setProperty("--mx", (x * 100) + "%"); c.style.setProperty("--my", (y * 100) + "%");
      c.classList.add("is-tilting");
    });
    document.addEventListener("pointerout", function (e) {
      var c = e.target.closest && e.target.closest(TILT);
      if (c && !c.contains(e.relatedTarget)) { c.style.transform = ""; c.classList.remove("is-tilting"); }
    });
  }

  document.querySelectorAll("[data-fact]").forEach(function(e){
    var v = e.dataset.fact.split(".").reduce(function(o,k){return o && o[k];}, S);
    e.innerHTML = v ? esc(v) : tbc;
  });


  // before/after slider: an invisible range input sits over the photos, so touch, mouse and keyboard all work
  document.querySelectorAll(".ba").forEach(function (b) {
    var r = b.querySelector("input[type=range]");
    function set() { b.style.setProperty("--pos", r.value + "%"); }
    r.addEventListener("input", set); set();
  });

  // video loops: load and play only near the screen, pause when far away; reduced-motion users keep the poster
  var calmVideo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vids = Array.prototype.slice.call(document.querySelectorAll("video[data-src]"));
  function checkVideos() {
    var vh = window.innerHeight || 800;
    vids.forEach(function (v) {
      if (calmVideo) return;
      var r = v.getBoundingClientRect(), near = r.bottom > -vh * 0.3 && r.top < vh * 1.3;
      if (near) {
        if (!v.getAttribute("src")) v.setAttribute("src", v.dataset.src);
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else if (v.getAttribute("src") && !v.paused) { v.pause(); }
    });
  }
  if (vids.length) {
    window.addEventListener("scroll", checkVideos, { passive: true });
    window.addEventListener("resize", checkVideos);
    window.addEventListener("load", checkVideos);
    setInterval(checkVideos, 600);
    checkVideos();
  }

  // entrance: rise and fade once, staggered inside each parent. Checked on scroll, so it never depends on observers.
  var pending = [];
  function show1(t) {
    var sib = Array.prototype.indexOf.call(t.parentNode.children, t);
    t.style.transitionDelay = Math.min(sib, 8) * 70 + "ms";
    t.classList.add("in");
    setTimeout(function () { t.style.transitionDelay = ""; t.classList.add("done"); }, 1100 + Math.min(sib, 8) * 70);
  }
  function check() {
    var vh = window.innerHeight || 800;
    pending = pending.filter(function (t) {
      var r = t.getBoundingClientRect();
      if (r.top < vh * 1.5) { show1(t); return false; }
      return true;
    });
  }
  function reveal(root) {
    var els = Array.prototype.slice.call(root.querySelectorAll(".rv:not(.in)"));
    if (!document.documentElement.classList.contains("js")) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    pending = pending.concat(els);
    check();
  }
  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; check(); }); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", check);
  setInterval(check, 400); // catches layout shifts as images load
  window.__reveal = reveal;
  reveal(document);
})();
