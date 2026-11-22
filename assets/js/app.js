// Enhancements for the static pages: menu, share/copy, filters, follow prompt, draft preview.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search), preview = params.has("preview");

  // ----- helpers -----
  function pubUrl(href) { var u = new URL(href || location.href, location.href); u.searchParams.delete("preview"); return u.href; }
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }
  function copy(text) {
    function fallback() {
      var t = document.createElement("textarea"); t.value = text; t.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); toast("Link copied"); } catch (e) { toast("Copy failed"); } t.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast("Link copied"); }, fallback); else fallback();
  }
  async function share(title, url) {
    if (navigator.share) { try { await navigator.share({ title: title, url: url }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
    copy(url);
  }

  // ----- follow prompt after a download (once per visit) -----
  var NAMES = { telegram: ["Telegram", "Join"], instagram: ["Instagram", "Follow"], pinterest: ["Pinterest", "Follow"], youtube: ["YouTube", "Subscribe"], whatsapp: ["WhatsApp", "Join"], linkedin: ["LinkedIn", "Connect"], x: ["X", "Follow"] };
  var promoDone = false; try { promoDone = sessionStorage.getItem("rl_promo") === "1"; } catch (e) {}
  function showPromo() {
    var url = document.body.dataset.leadUrl, pf = document.body.dataset.leadPlatform;
    if (promoDone || !url || !NAMES[pf]) return; promoDone = true; try { sessionStorage.setItem("rl_promo", "1"); } catch (e) {}
    var box = document.createElement("div"); box.className = "promo"; box.setAttribute("role", "status");
    var t = document.createElement("span"); t.textContent = "Get new resources first: " + (pf === "telegram" ? "join our Telegram." : "follow us on " + NAMES[pf][0] + "."); box.appendChild(t);
    var a = document.createElement("a"); a.className = "btn small"; a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = NAMES[pf][1]; box.appendChild(a);
    var x = document.createElement("button"); x.type = "button"; x.className = "icon-btn sm"; x.setAttribute("aria-label", "Dismiss"); x.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-close"/></svg>'; x.addEventListener("click", function () { box.remove(); }); box.appendChild(x);
    document.body.appendChild(box); setTimeout(function () { box.remove(); }, 10000);
  }

  // ----- menu (also closes with Esc) -----
  function setMenu(open) {
    var h = $("site-header"); if (!h) return; h.classList.toggle("open", open);
    var b = h.querySelector("[data-menu]"); if (!b) return;
    b.setAttribute("aria-expanded", String(open)); b.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    b.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-' + (open ? "close" : "menu") + '"/></svg>';
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { var h = $("site-header"); if (h && h.classList.contains("open")) { setMenu(false); var b = h.querySelector("[data-menu]"); if (b) b.focus(); } } });

  // ----- one delegated click handler (works after a preview re-render too) -----
  document.addEventListener("click", function (e) {
    var t = e.target, el;
    if ((el = t.closest("[data-share]"))) { share(el.dataset.share, pubUrl(el.dataset.href)); return; }
    if ((el = t.closest("[data-copy]"))) { copy(pubUrl(el.dataset.href)); return; }
    if ((el = t.closest("[data-menu]"))) { setMenu(!$("site-header").classList.contains("open")); return; }
    if (t.closest(".mainnav a")) setMenu(false);
    if (t.closest("a[data-dl]")) setTimeout(showPromo, 700);
  });
  window.addEventListener("scroll", function () { document.body.classList.toggle("scrolled", window.scrollY > 40); }, { passive: true });

  // ----- "New" badges expire after 14 days even if the site was not rebuilt -----
  function expireBadges() {
    document.querySelectorAll("[data-new]").forEach(function (b) { var d = (Date.now() - new Date(b.dataset.new).getTime()) / 864e5; if (isNaN(d) || d > 14) b.remove(); });
  }

  // ----- search + filters on listing pages (cards are already in the HTML) -----
  function initFilters() {
    var grid = $("grid"); if (!grid) return;
    var items = Array.prototype.filter.call(grid.children, function (c) { return c.dataset.search != null; });
    var q = $("q"), type = $("type"), lang = $("lang"), count = $("count"), empty = $("empty"), chips = Array.prototype.slice.call(document.querySelectorAll("[data-chip]")), cat = "";
    var want = params.get("cat"); chips.forEach(function (c) { if (want && c.dataset.chip === want) cat = want; });
    function apply() {
      var s = q ? q.value.trim().toLowerCase() : "", n = 0;
      items.forEach(function (it) {
        var ok = (!cat || it.dataset.cat === cat) && (!type || !type.value || it.dataset.type === type.value) && (!lang || !lang.value || it.dataset.lang === lang.value) && (!s || it.dataset.search.indexOf(s) > -1);
        it.hidden = !ok; if (ok) n++;
      });
      if (count) count.textContent = n + " " + (count.dataset.noun || "item") + (n === 1 ? "" : "s");
      if (empty) empty.hidden = n > 0;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.chip === cat)); });
    }
    if (q) q.addEventListener("input", apply); if (type) type.addEventListener("change", apply); if (lang) lang.addEventListener("change", apply);
    chips.forEach(function (c) { c.addEventListener("click", function () { cat = c.dataset.chip; apply(); }); });
    apply();
  }

  function highlightHash() {
    var id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
    var t = document.getElementById(id); if (t) { t.scrollIntoView({ block: "center" }); t.classList.add("hl"); }
  }

  function start() { expireBadges(); initFilters(); highlightHash(); if (window.initTheme) window.initTheme(); }

  // ----- preview of unpublished admin changes (home, resources, websites, about) -----
  function loadScript(src) { return new Promise(function (ok, no) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  async function previewRender() {
    var page = document.body.dataset.page, raw = null;
    if (!{ index: 1, resources: 1, websites: 1, about: 1 }[page]) return false;
    try { raw = JSON.parse(localStorage.getItem("rl_work")); } catch (e) {}
    if (!raw) return false;
    if (!window.RENDER) { try { await loadScript(document.querySelector('script[src$="assets/js/app.js"]').src.replace("app.js", "render.js")); } catch (e) { return false; } }
    var d = window.RENDER.normalize(raw, { preview: true }), lead = d.social[0];
    document.getElementById("app").innerHTML = window.RENDER.page(page, d, { depth: 0, preview: true });
    if (lead) { document.body.dataset.leadUrl = lead.url; document.body.dataset.leadPlatform = lead.platform; }
    var bar = document.createElement("div"); bar.className = "preview-bar";
    var u = new URL(location.href); u.searchParams.delete("preview");
    bar.innerHTML = 'Preview of your unpublished changes. <a href="' + u.pathname.split("/").pop() + '">Exit preview</a>';
    document.body.insertBefore(bar, document.body.firstChild); return true;
  }

  (async function () { if (preview) { try { await previewRender(); } catch (e) {} } start(); })();
})();
