(function () {
  var calm0 = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!calm0 && "IntersectionObserver" in window) document.documentElement.classList.add("js");
  var S = window.SALON, page = document.body.dataset.page;
  var nav = [["index.html","Home"],["services.html","Services"],["gallery.html","Gallery"],["about.html","About"],["visit.html","Visit"]];
  function esc(t){var d=document.createElement("div");d.textContent=t;return d.innerHTML;}
  var tbc = '<span class="tbc">To be confirmed</span>';

  document.getElementById("site-header").innerHTML =
    '<a class="skip" href="#main">Skip to content</a>' +
    '<div class="bar"><a class="brand" href="index.html">' + esc(S.name) + '</a>' +
    '<button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>' +
    '<nav id="nav" aria-label="Main">' + nav.map(function(n){
      return '<a href="'+n[0]+'"'+(n[0].indexOf(page)===0?' aria-current="page"':'')+'>'+n[1]+'</a>';
    }).join("") + '</nav>' +
    '<a class="btn" href="'+S.bookingUrl+'" target="_blank" rel="noopener">Book now</a></div>' +
    '<p class="review-banner">DRAFT: content from the public GlossGenius page, awaiting owner review.</p>';

var CREDITS = [["Alice through the looking glass", "https://commons.wikimedia.org/wiki/File:Alice_through_the_looking_glass.jpg"], ["Alice in the train carriage", "https://commons.wikimedia.org/wiki/File:Through_the_Looking_Glass_Gentleman_dressed_in_paper.png"], ["Alice and the White King", "https://commons.wikimedia.org/wiki/File:The_king_from_Through_the_Looking-Glass,_and_What_Alice_Found_There.jpg"], ["1907 edition page", "https://commons.wikimedia.org/wiki/File:Through_the_looking-glass_and_what_Alice_found_there_1907_(142075691).jpg"], ["Alice and the White Queen", "https://commons.wikimedia.org/wiki/File:Alice_and_white_queen.jpg"], ["Alice with the White Queen", "https://commons.wikimedia.org/wiki/File:Alice_with_White_Queen_(Illustration_by_John_Tenniel).png"], ["Alice and the Red Queen", "https://commons.wikimedia.org/wiki/File:Alice_queen2.jpg"], ["Alice between the Queens", "https://commons.wikimedia.org/wiki/File:Alice_Red_Queen_White_Queen.jpg"]];
  document.getElementById("site-footer").innerHTML =
    '<p><strong>' + esc(S.name) + '</strong> · ' + (S.location.city ? esc(S.location.city) : tbc) + '</p>' +
    '<p>Booking is completed on GlossGenius. <a href="'+S.bookingUrl+'" target="_blank" rel="noopener">Book an appointment</a></p>' +
    '<p>Illustrations from <em>Through the Looking-Glass</em> by John Tenniel (1871) and a 1907 edition, all public domain, via Wikimedia Commons: ' +
    CREDITS.map(function (c) { return '<a href="' + c[1] + '">' + esc(c[0]) + '</a>'; }).join(", ") +
    '. They show Lewis Carroll\u2019s story, not this salon\u2019s work.</p>';

  var fb = document.createElement("a");
  fb.className = "btn float-book"; fb.textContent = "Book"; fb.href = S.bookingUrl;
  fb.target = "_blank"; fb.rel = "noopener"; fb.setAttribute("aria-label", "Book an appointment on GlossGenius");
  document.body.appendChild(fb);

  var btn = document.querySelector(".menu-btn"), n = document.getElementById("nav");
  btn.addEventListener("click", function(){
    var open = n.classList.toggle("open"); btn.setAttribute("aria-expanded", open);
  });

  document.querySelectorAll("[data-book]").forEach(function(a){
    a.href = S.bookingUrl; a.target = "_blank"; a.rel = "noopener";
  });

  var el = document.getElementById("services");
  if (el) {
    var chips = document.getElementById("chips");
    function card(s) {
      var url = s.url || S.bookingUrl;
      return '<article class="svc-card"><h3>' + esc(s.name) + '</h3>' +
        '<div class="svc-top"><span class="svc-price">' + esc(s.price || "") + '</span>' +
        (s.duration ? '<span class="svc-time">' + s.duration + ' min</span>' : '') +
        '<a class="svc-book" href="' + esc(url) + '" target="_blank" rel="noopener" aria-label="Book ' + esc(s.name) + '">Book <span aria-hidden="true">\u2192</span></a></div>' +
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
    var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine && !calm) {
      el.addEventListener("pointermove", function (e) {
        var c = e.target.closest(".svc-card"); if (!c) return;
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.transform = "perspective(700px) rotateY(" + ((x - .5) * 10) + "deg) rotateX(" + ((.5 - y) * 10) + "deg) translateZ(0)";
        c.style.setProperty("--mx", (x * 100) + "%"); c.style.setProperty("--my", (y * 100) + "%");
      });
      el.addEventListener("pointerout", function (e) {
        var c = e.target.closest(".svc-card"); if (c && !c.contains(e.relatedTarget)) c.style.transform = "";
      });
    }
  }

  var gal = document.getElementById("gallery");
  if (gal) {
    gal.innerHTML = window.GALLERY.map(function(g){
      return '<figure class="rv">' + (g.src ? '<img src="'+g.src+'" alt="'+esc(g.alt)+'" loading="lazy">' :
        '<div class="ph" role="img" aria-label="Photo placeholder">Photo pending approval</div>') +
        '<figcaption>'+esc(g.caption)+'</figcaption></figure>';
    }).join("");
  }

  document.querySelectorAll("[data-fact]").forEach(function(e){
    var v = e.dataset.fact.split(".").reduce(function(o,k){return o && o[k];}, S);
    e.innerHTML = v ? esc(v) : tbc;
  });

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
