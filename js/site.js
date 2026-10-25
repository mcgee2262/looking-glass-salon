(function () {
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

  document.getElementById("site-footer").innerHTML =
    '<p><strong>' + esc(S.name) + '</strong> · ' + (S.location.city ? esc(S.location.city) : tbc) + '</p>' +
    '<p>Booking is completed on GlossGenius. <a href="'+S.bookingUrl+'" target="_blank" rel="noopener">Book an appointment</a></p>';

  var btn = document.querySelector(".menu-btn"), n = document.getElementById("nav");
  btn.addEventListener("click", function(){
    var open = n.classList.toggle("open"); btn.setAttribute("aria-expanded", open);
  });

  document.querySelectorAll("[data-book]").forEach(function(a){
    a.href = S.bookingUrl; a.target = "_blank"; a.rel = "noopener";
  });

  var el = document.getElementById("services");
  if (el) {
    var feature = el.dataset.featured === "true";
    el.innerHTML = window.SERVICES.map(function(g){
      return '<section class="cat"><h2>'+esc(g.cat)+'</h2><ul>' + g.items.map(function(s){
        var meta = [s.price, s.duration ? s.duration + " min" : null].filter(Boolean).join(" · ");
        return '<li><div class="svc-head"><h3>'+esc(s.name)+'</h3><span class="meta">'+esc(meta)+'</span></div>' +
          (s.desc ? '<p>'+esc(s.desc)+'</p>' : '') + '</li>';
      }).join("") + '</ul></section>';
    }).join("");
  }

  var gal = document.getElementById("gallery");
  if (gal) {
    gal.innerHTML = window.GALLERY.map(function(g){
      return '<figure>' + (g.src ? '<img src="'+g.src+'" alt="'+esc(g.alt)+'" loading="lazy">' :
        '<div class="ph" role="img" aria-label="Photo placeholder">Photo pending approval</div>') +
        '<figcaption>'+esc(g.caption)+'</figcaption></figure>';
    }).join("");
  }

  document.querySelectorAll("[data-fact]").forEach(function(e){
    var v = e.dataset.fact.split(".").reduce(function(o,k){return o && o[k];}, S);
    e.innerHTML = v ? esc(v) : tbc;
  });
})();
