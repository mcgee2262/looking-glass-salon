// Booking preview: looks and feels like real booking, but nothing is sent or saved.
(function () {
  var panel = document.getElementById("bk-panel");
  if (!panel) return;
  var sumBody = document.getElementById("bk-sum-body");
  var steps = document.querySelectorAll(".bk-steps li");
  function esc(t) { var d = document.createElement("div"); d.textContent = t == null ? "" : t; return d.innerHTML; }

  // category pictures: AI-made still lifes of the tools for each service (not photos of her work)
  var PHOTO = {
    "Consultation & Cuts": "assets/book/consult.jpg",
    "Color": "assets/book/color.jpg",
    "Highlights & Balayage": "assets/book/highlights.jpg",
    "Add-Ons": "assets/book/addons.jpg",
    "Smoothing Treatments": "assets/book/smoothing.jpg",
    "Extensions": "assets/book/extensions.jpg"
  };

  var ICON = {
    "Add-Ons": '<path d="M24 6c6 9 12 15 12 22a12 12 0 0 1-24 0c0-7 6-13 12-22z"/>',
    "Smoothing Treatments": '<path d="M8 14c8-6 24 6 32 0M8 24c8-6 24 6 32 0M8 34c8-6 24 6 32 0" fill="none" stroke-width="3" stroke-linecap="round"/>',
    "Extensions": '<path d="M16 6v36M24 6v36M32 6v36" fill="none" stroke-width="3" stroke-linecap="round"/><path d="M12 6h24v6H12z"/>'
  };

  var all = [];
  window.SERVICES.forEach(function (g) { g.items.forEach(function (i) { i.cat = g.cat; all.push(i); }); });
  var addOns = all.filter(function (s) { return s.cat === "Add-Ons"; });

  var st = { step: 1, cat: "All", svc: null, extras: [], date: null, time: null, who: null };

  function money(p) { var m = /\$(\d+)/.exec(p || ""); return m ? +m[1] : 0; }
  function plus(p) { return /\+/.test(p || ""); }
  function dur(m) { var h = Math.floor(m / 60), r = m % 60; return (h ? h + " hr" : "") + (h && r ? " " : "") + (r ? r + " min" : ""); }
  function thumb(s, cls) {
    if (PHOTO[s.cat]) return '<div class="' + cls + '"><img src="' + PHOTO[s.cat] + '" alt="" decoding="async"></div>';
    return '<div class="' + cls + ' bk-icon"><svg viewBox="0 0 48 48" aria-hidden="true">' + (ICON[s.cat] || ICON["Add-Ons"]) + '</svg></div>';
  }
  function chosen() { return [st.svc].concat(st.extras).filter(Boolean); }
  function fmtDate(d) { return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); }

  function summary() {
    var c = chosen();
    if (!c.length) { sumBody.innerHTML = '<p class="bk-muted">Pick a service to start.</p>'; return; }
    var total = 0, mins = 0, from = false;
    var rows = c.map(function (s) {
      total += money(s.price); mins += s.duration || 0; from = from || plus(s.price);
      return '<li><span>' + esc(s.name) + '</span><span>' + esc(s.price) + '</span></li>';
    }).join("");
    var dep = /deposit/i.test(st.svc && st.svc.desc || "") ? '<p class="bk-dep">' + esc((/\$[\d.,]+ deposit[^.]*\./i.exec(st.svc.desc) || [""])[0] || "A deposit is required.") + '</p>' : "";
    sumBody.innerHTML = '<ul class="bk-lines">' + rows + '</ul>' +
      '<p class="bk-total"><span>Estimated total</span><strong>' + (from ? "from " : "") + "$" + total + '</strong></p>' +
      '<p class="bk-muted">About ' + dur(mins) + ' with ' + esc(window.SALON.owner.name) + '</p>' +
      (st.date ? '<p class="bk-when">' + fmtDate(st.date) + (st.time ? ' at ' + st.time : '') + '</p>' : '') + dep;
  }

  function go(n) {
    st.step = n;
    steps.forEach(function (li) {
      var k = +li.dataset.step;
      li.className = k < n ? "done" : k === n ? "now" : "";
      if (k === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    [null, stepService, stepExtras, stepTime, stepDetails, stepDone][n]();
    summary();
    var h = panel.querySelector("h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    if (window.__reveal) window.__reveal(panel);
    var top = document.querySelector(".bk-steps").getBoundingClientRect().top + window.scrollY - 16;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
  }
  function back(n) { return '<button type="button" class="bk-back" data-go="' + n + '">← Back</button>'; }

  function stepService() {
    var cats = ["All"].concat(window.SERVICES.map(function (g) { return g.cat; }));
    var list = all.filter(function (s) { return st.cat === "All" || s.cat === st.cat; });
    panel.innerHTML = '<h2>Choose a service</h2>' +
      '<div class="chips" role="group" aria-label="Filter services">' + cats.map(function (c) {
        return '<button type="button" data-cat="' + esc(c) + '" aria-pressed="' + (c === st.cat) + '">' + esc(c) + '</button>';
      }).join("") + '</div>' +
      '<div class="bk-list">' + list.map(function (s) {
        var i = all.indexOf(s);
        return '<article class="bk-svc' + (st.svc === s ? ' picked' : '') + '">' + thumb(s, "bk-thumb") +
          '<div class="bk-info"><h3>' + esc(s.name) + '</h3>' + (s.desc ? '<p>' + esc(s.desc) + '</p>' : '') +
          '<p class="bk-meta"><strong>' + esc(s.price) + '</strong>' + (s.duration ? '<span>' + dur(s.duration) + '</span>' : '') + '</p></div>' +
          '<button type="button" class="btn bk-select" data-svc="' + i + '" aria-label="Select ' + esc(s.name) + '">Select</button></article>';
      }).join("") + '</div>';
  }

  function stepExtras() {
    var opts = addOns.filter(function (a) { return a !== st.svc; });
    panel.innerHTML = back(1) + '<h2>Add any extras?</h2><p class="bk-muted">Optional. Tap to add or remove.</p>' +
      '<div class="bk-extras">' + opts.map(function (a) {
        var on = st.extras.indexOf(a) >= 0;
        return '<button type="button" class="bk-extra" data-extra="' + all.indexOf(a) + '" aria-pressed="' + on + '">' + thumb(a, "bk-mini") +
          '<span class="bk-xname">' + esc(a.name) + '<small>' + esc(a.desc || "") + '</small></span>' +
          '<span class="bk-xprice">' + esc(a.price) + '</span><span class="bk-check" aria-hidden="true">' + (on ? "✓" : "+") + '</span></button>';
      }).join("") + '</div>' +
      '<p class="bk-next"><button type="button" class="btn big" data-go="3">' + (st.extras.length ? "Continue" : "Skip extras") + '</button></p>';
  }

  // sample availability: closed Sun/Mon, some slots taken; stable per date so it feels real
  function slots(d) {
    var out = [], seed = d.getDate() * 7 + d.getMonth() * 3;
    for (var h = 9; h < 17; h++) for (var m = 0; m < 60; m += 30) {
      seed = (seed * 31 + 11) % 97;
      out.push({ t: (h > 12 ? h - 12 : h) + ":" + (m ? "30" : "00") + (h >= 12 ? " PM" : " AM"), open: seed % 3 !== 0 });
    }
    return out;
  }
  function stepTime() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var days = [];
    for (var k = 1; days.length < 14; k++) { var d = new Date(today); d.setDate(today.getDate() + k); days.push(d); }
    if (!st.date) st.date = days.filter(function (d) { return d.getDay() > 1; })[0];
    var open = st.date.getDay() > 1;
    panel.innerHTML = back(2) + '<h2>Pick a date and time</h2><p class="bk-muted">Sample times for this preview. Real hours are to be confirmed.</p>' +
      '<div class="bk-days" role="group" aria-label="Dates">' + days.map(function (d, i) {
        var closed = d.getDay() <= 1, on = +d === +st.date;
        return '<button type="button" class="bk-day" data-day="' + i + '" aria-pressed="' + on + '"' + (closed ? ' disabled' : '') +
          ' aria-label="' + fmtDate(d) + (closed ? ', closed' : '') + '"><small>' + d.toLocaleDateString("en-US", { weekday: "short" }) +
          '</small><strong>' + d.getDate() + '</strong><small>' + (closed ? "Closed" : d.toLocaleDateString("en-US", { month: "short" })) + '</small></button>';
      }).join("") + '</div>' +
      '<h3 class="bk-sub">' + fmtDate(st.date) + '</h3>' +
      (open ? '<div class="bk-times" role="group" aria-label="Times">' + slots(st.date).map(function (s) {
        return '<button type="button" class="bk-time" data-time="' + s.t + '" aria-pressed="' + (st.time === s.t) + '"' + (s.open ? '' : ' disabled aria-label="' + s.t + ', taken"') + '>' + s.t + '</button>';
      }).join("") + '</div>' : '<p>Closed this day.</p>') +
      '<p class="bk-next"><button type="button" class="btn big" data-go="4"' + (st.time ? '' : ' disabled') + '>Continue</button></p>';
    panel._days = days;
  }

  function stepDetails() {
    var w = st.who || {};
    function f(id, label, type, ac, req) {
      return '<p class="bk-field"><label for="bk-' + id + '">' + label + (req ? '' : ' <span class="bk-muted">(optional)</span>') + '</label>' +
        '<input id="bk-' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + ac + '"' + (req ? ' required' : '') + ' value="' + esc(w[id] || "") + '"></p>';
    }
    panel.innerHTML = back(3) + '<h2>Your details</h2>' +
      '<form id="bk-form" class="bk-form" novalidate>' +
      f("name", "Full name", "text", "name", true) + f("phone", "Phone", "tel", "tel", true) + f("email", "Email", "email", "email", true) +
      '<p class="bk-field"><label for="bk-notes">Anything we should know? <span class="bk-muted">(optional)</span></label><textarea id="bk-notes" name="notes" rows="3">' + esc(w.notes || "") + '</textarea></p>' +
      '<p class="bk-field bk-err" role="alert"></p>' +
      '<p class="bk-next"><button type="submit" class="btn big">Request appointment</button></p>' +
      '<p class="bk-muted bk-small">Preview only: this form does not send anything.</p></form>';
    panel.querySelector("#bk-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var fm = e.target, bad = Array.prototype.filter.call(fm.querySelectorAll("[required]"), function (i) { return !i.checkValidity(); });
      fm.querySelectorAll("input").forEach(function (i) { i.setAttribute("aria-invalid", bad.indexOf(i) >= 0); });
      if (bad.length) { fm.querySelector(".bk-err").textContent = "Please fill in your " + bad.map(function (i) { return fm.querySelector('label[for="' + i.id + '"]').firstChild.textContent.trim().toLowerCase(); }).join(", ") + "."; bad[0].focus(); return; }
      st.who = { name: fm.name.value, phone: fm.phone.value, email: fm.email.value, notes: fm.notes.value };
      go(5);
    });
  }

  function stepDone() {
    panel.innerHTML = '<div class="bk-done"><div class="bk-seal" aria-hidden="true">✓</div><h2>You’re all set' + (st.who && st.who.name ? ', ' + esc(st.who.name.split(" ")[0]) : '') + '!</h2>' +
      '<p>Brandie will see you for ' + esc(st.svc.name) + ' on ' + fmtDate(st.date) + ' at ' + st.time + '.</p>' +
      '<p class="bk-demo"><strong>Preview only.</strong> This is what clients would see. No appointment was made and nothing was sent.</p>' +
      '<p class="bk-next"><button type="button" class="btn big" data-reset>Start over</button></p></div>';
  }

  panel.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || b.disabled) return;
    if (b.dataset.cat) { st.cat = b.dataset.cat; stepService(); if (window.__reveal) window.__reveal(panel); return; }
    if (b.dataset.svc) { st.svc = all[+b.dataset.svc]; st.extras = []; go(st.svc.cat === "Add-Ons" ? 3 : 2); return; }
    if (b.dataset.extra) {
      var a = all[+b.dataset.extra], at = st.extras.indexOf(a);
      if (at >= 0) st.extras.splice(at, 1); else st.extras.push(a);
      stepExtras(); summary(); panel.querySelector('[data-extra="' + b.dataset.extra + '"]').focus(); return;
    }
    if (b.dataset.day) { st.date = panel._days[+b.dataset.day]; st.time = null; stepTime(); summary(); panel.querySelector('[data-day="' + b.dataset.day + '"]').focus(); return; }
    if (b.dataset.time) { st.time = b.dataset.time; stepTime(); summary(); panel.querySelector('[data-time="' + b.dataset.time + '"]').focus(); return; }
    if (b.dataset.go) { var n = +b.dataset.go; if (n === 2 && st.svc && st.svc.cat === "Add-Ons") n = 1; go(n); return; }
    if (b.hasAttribute("data-reset")) { st = { step: 1, cat: "All", svc: null, extras: [], date: null, time: null, who: null }; go(1); }
  });

  // services page links here with ?s=<index> to start on that service
  var pre = /[?&]s=(\d+)/.exec(location.search);
  if (pre && all[+pre[1]]) { st.svc = all[+pre[1]]; st.cat = st.svc.cat; go(st.svc.cat === "Add-Ons" ? 3 : 2); }
  else go(1);
})();
