(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(); else root.RENDER = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var HUES = [225, 155, 32, 330, 270, 190];
  var PLATFORMS = {
    telegram: { label: "Telegram", cta: "Join channel", text: "New study notes, ebooks and resources the moment they are added.", hosts: ["t.me", "telegram.me", "telegram.org"] },
    instagram: { label: "Instagram", cta: "Follow", text: "Study tips, previews and quick updates.", hosts: ["instagram.com"] },
    pinterest: { label: "Pinterest", cta: "Follow", text: "Boards with planners, templates and study ideas.", hosts: ["pinterest.com", "pin.it"] },
    youtube: { label: "YouTube", cta: "Subscribe", text: "Walkthroughs and video guides.", hosts: ["youtube.com", "youtu.be"] },
    whatsapp: { label: "WhatsApp", cta: "Join", text: "Updates straight to your phone.", hosts: ["whatsapp.com", "wa.me"] },
    linkedin: { label: "LinkedIn", cta: "Connect", text: "Professional updates and collaborations.", hosts: ["linkedin.com"] },
    x: { label: "X", cta: "Follow", text: "Quick updates and links.", hosts: ["x.com", "twitter.com"] }
  };
  var KNOWN = ["Study Notes", "eBooks", "Templates", "Guides", "Question Papers", "Worksheets"];
  var FIRST = ["Study Notes", "eBooks"];
  var SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' +
    '<symbol id="i-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></symbol>' +
    '<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></symbol>' +
    '<symbol id="i-telegram" viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></symbol>' +
    '<symbol id="i-instagram" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></symbol>' +
    '<symbol id="i-pinterest" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026z"/></symbol>' +
    '<symbol id="i-youtube" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><path d="m9.75 15.02 5.75-3.27-5.75-3.27z"/></symbol>' +
    '<symbol id="i-whatsapp" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></symbol>' +
    '<symbol id="i-linkedin" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></symbol>' +
    '<symbol id="i-x" viewBox="0 0 24 24"><path d="M4 4l16 16M20 4 4 20"/></symbol>' +
    '<symbol id="i-mail" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></symbol>' +
    '<symbol id="i-pin" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></symbol>' +
    '<symbol id="i-go" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m10 8 4 4-4 4"/></symbol>' +
    '<symbol id="i-out" viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></symbol>' +
    '<symbol id="i-share" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></symbol>' +
    '<symbol id="i-link" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></symbol>' +
    '<symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></symbol>' +
    '<symbol id="i-close" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol>' +
    '</svg>';
  // ---------- helpers ----------
  function arr(x) { return Array.isArray(x) ? x : []; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function validUrl(u) { try { var x = new URL(u); return x.protocol === "https:" ? x.href : ""; } catch (e) { return ""; } }
  function safeUrl(u) { return validUrl(u) || "#"; }
  function safeFile(p) { return /^files\/(?!.*\.\.)[A-Za-z0-9._\/-]+$/.test(p || "") ? p : ""; }
  function hostOk(platform, u) {
    try { var h = new URL(u).hostname.replace(/^www\./, ""); return PLATFORMS[platform].hosts.some(function (x) { return h === x || h.slice(-x.length - 1) === "." + x; }); } catch (e) { return false; }
  }
  function size(b) { return !b ? "" : b < 1048576 ? Math.max(1, Math.round(b / 1024)) + " KB" : (b / 1048576).toFixed(1) + " MB"; }
  function fmtDate(s) { var d = new Date(s); return !s || isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); }
  function isNew(s) { var d = (Date.now() - new Date(s).getTime()) / 864e5; return !isNaN(d) && d >= -1 && d <= 14; }
  function hue(k) { var h = 0; k = String(k || ""); for (var i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) % HUES.length; return HUES[h]; }
  function slugify(t) { return String(t || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60); }
  function catKey(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9\u0900-\u097f]/g, "").replace(/s$/, ""); }
  // Same category with different spelling ("ebook", "eBooks", "study notes") becomes one category.
  function canonCat(name, existing) {
    var n = String(name || "").trim().replace(/\s+/g, " "); if (!n) return "General";
    var pool = KNOWN.concat(arr(existing)), k = catKey(n);
    for (var i = 0; i < pool.length; i++) if (catKey(pool[i]) === k) return pool[i];
    return n;
  }
  function sortResources(list) {
    // featured first, then newest date; on the same date the item added last comes first
    return list.map(function (p, i) { return { p: p, i: i }; }).sort(function (a, b) {
      return (b.p.featured ? 1 : 0) - (a.p.featured ? 1 : 0) || String(b.p.added || b.p.updated || "").localeCompare(String(a.p.added || a.p.updated || "")) || b.i - a.i;
    }).map(function (x) { return x.p; });
  }
  function catList(res) {
    var map = {}; res.forEach(function (p) { map[p.category] = (map[p.category] || 0) + 1; });
    var used = {};
    return Object.keys(map).sort(function (a, b) {
      var ia = FIRST.indexOf(a), ib = FIRST.indexOf(b);
      return ia > -1 || ib > -1 ? (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) : a.localeCompare(b);
    }).map(function (name, i) {
      var slug = slugify(name) || "category-" + (i + 1); if (used[slug]) slug += "-" + (i + 1); used[slug] = 1;
      return { name: name, slug: slug, count: map[name] };
    });
  }
  function handle(u) {
    try { var p = new URL(u).pathname.split("/").filter(Boolean), l = (p[p.length - 1] || "").replace(/^@/, ""); return l && l.length <= 30 && /^[A-Za-z0-9_.-]+$/.test(l) ? "@" + l : ""; } catch (e) { return ""; }
  }

  // ---------- data ----------
  function normalize(d, o) {
    o = o || {}; d = d || {};
    var s = Object.assign({ name: "Resource Hub", headline: "Free templates, docs and guides you can download today.", description: "Study notes, ebooks and templates, ready to download in one click.", email: "", location: "", url: "", author: "" }, d.site || {});
    function keep(x) { return x && (o.preview || !x.sample); } // sample items never go live
    var seen = [], used = {};
    var resources = arr(d.resources).filter(function (p) { return keep(p) && p.title; }).map(function (p) {
      var c = canonCat(p.category, seen); if (seen.indexOf(c) < 0) seen.push(c);
      var q = Object.assign({}, p, { category: c, added: p.added || p.updated || "" });
      var base = slugify(p.slug || p.title) || "resource"; if (used[base]) base += "-" + (slugify(p.id) || Object.keys(used).length);
      used[base] = 1; q.slug = base; return q;
    });
    resources = sortResources(resources);
    var social = arr(d.social).filter(function (x) { return keep(x) && PLATFORMS[x.platform] && validUrl(x.url) && hostOk(x.platform, x.url); })
      .sort(function (a, b) { return (b.platform === "telegram" ? 1 : 0) - (a.platform === "telegram" ? 1 : 0); });
    var links = arr(d.links).filter(function (l) { return keep(l) && l.name && validUrl(l.url); });
    return { site: s, social: social, resources: resources, links: links, cats: catList(resources) };
  }

  // ---------- urls ----------
  function px(ctx) { return ctx.prefix != null ? ctx.prefix : (ctx.depth ? "../" : ""); }
  function link(ctx, page, hash) { return px(ctx) + page + (ctx.preview ? "?preview=1" : "") + (hash ? "#" + hash : ""); }
  function detailHref(p, ctx) { return ctx.preview ? link(ctx, "resources.html", "r-" + p.id) : px(ctx) + "resources/" + p.slug + ".html"; }
  function catHref(c, ctx) { return ctx.preview ? px(ctx) + "resources.html?preview=1&cat=" + encodeURIComponent(c.name) : px(ctx) + "category/" + c.slug + ".html"; }

  // ---------- components ----------
  function ico(id, cls) { return '<svg class="ico' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function shareBtn(title, href) {
    return '<button class="icon-btn sm" type="button" data-share="' + esc(title) + '" data-href="' + esc(href) + '" aria-label="Share ' + esc(title) + '" title="Share or copy link">' + ico("share") + "</button>";
  }
  function card(p, ctx, wide) {
    var det = detailHref(p, ctx), file = p.source === "file" && safeFile(p.url);
    var href = file ? px(ctx) + file : safeUrl(p.url), when = p.added || p.updated;
    var badge = p.badge ? '<span class="badge">' + esc(p.badge) + "</span>" : isNew(when) ? '<span class="badge" data-new="' + esc(when) + '">New</span>' : "";
    var meta = [p.type, p.pages ? p.pages + " pages" : "", size(p.size), p.language, (p.updated || p.added) ? "Updated " + fmtDate(p.updated || p.added) : ""].filter(Boolean).join(" \u00b7 ");
    var tags = (p.category ? '<span class="cat">' + esc(p.category) + "</span>" : "") + (p.subject ? '<span class="sub">' + esc(p.subject) + "</span>" : "");
    var btn = file ? '<a class="btn" href="' + esc(href) + '" download="' + esc(p.filename || "") + '" data-dl="1" aria-label="Download ' + esc(p.title) + '">Download</a>'
      : '<a class="btn" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" data-dl="1" aria-label="Open ' + esc(p.title) + '">Get resource</a>';
    return '<article class="card' + (wide && p.featured ? " featured" : "") + '" id="r-' + esc(p.id) + '" style="--h:' + hue(p.category) + '" data-cat="' + esc(p.category) + '" data-type="' + esc(p.type) + '" data-lang="' + esc(p.language) + '" data-search="' + esc([p.title, p.description, p.category, p.subject].join(" ").toLowerCase()) + '">' +
      '<div class="thumb"><span class="ft">' + esc(p.type || "File") + "</span>" + badge + "</div>" +
      '<div class="body">' + (tags ? '<div class="tags">' + tags + "</div>" : "") + '<h3><a href="' + esc(det) + '">' + esc(p.title) + "</a></h3><p>" + esc(p.description) + '</p><div class="meta">' + esc(meta) + '</div><div class="buy">' + btn + shareBtn(p.title, det) + "</div></div></article>";
  }
  function siteCard(l, ctx) {
    return '<div class="site" id="w-' + esc(l.id) + '" style="--h:' + hue(l.name) + '" data-cat="' + esc(l.category || "") + '" data-search="' + esc([l.name, l.description, l.category].join(" ").toLowerCase()) + '">' +
      '<a class="site-link" href="' + esc(safeUrl(l.url)) + '" target="_blank" rel="noopener noreferrer"><div class="tile">' + esc(l.name.charAt(0).toUpperCase()) + "</div><div><h3>" + esc(l.name) + "</h3><p>" + esc(l.description || "") + "</p>" +
      (l.category ? '<span class="s-cat">' + esc(l.category) + "</span>" : "") + "</div>" + ico("out", "s-go") + "</a>" + shareBtn(l.name, px(ctx) + "websites.html#w-" + l.id) + "</div>";
  }
  function socialCard(x, i) {
    var P = PLATFORMS[x.platform], hd = x.platform === "whatsapp" ? "" : handle(x.url);
    return '<div class="soc' + (i === 0 ? " lead" : "") + '"><div class="soc-top"><span class="soc-ico">' + ico(x.platform) + "</span><div><h3>" + esc(P.label) + "</h3>" + (hd ? '<span class="handle">' + esc(hd) + "</span>" : "") + "</div></div><p>" + esc(P.text) +
      '</p><a class="btn small' + (i === 0 ? "" : " ghost") + '" href="' + esc(validUrl(x.url)) + '" target="_blank" rel="noopener noreferrer">' + esc(P.cta) + "</a></div>";
  }
  function catTile(c, ctx) { return '<a class="cat-tile" style="--h:' + hue(c.name) + '" href="' + esc(catHref(c, ctx)) + '"><b>' + esc(c.name) + "</b><span>" + c.count + (c.count === 1 ? " file" : " files") + "</span></a>"; }
  function chips(items, label) {
    return '<div class="filters" role="group" aria-label="' + esc(label) + '"><button class="chip" type="button" data-chip="" aria-pressed="true">All</button>' +
      items.map(function (n) { return '<button class="chip" type="button" data-chip="' + esc(n) + '" aria-pressed="false">' + esc(n) + "</button>"; }).join("") + "</div>";
  }
  function uniq(list, key) { var o = {}; return list.map(function (x) { return x[key]; }).filter(function (v) { if (!v || o[v]) return false; o[v] = 1; return true; }); }
  function options(list, label) { return '<option value="">' + esc(label) + "</option>" + list.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + "</option>"; }).join(""); }
  function crumbs(ctx, items) {
    return '<nav class="crumbs" aria-label="Breadcrumb">' + items.map(function (it, i) {
      return i === items.length - 1 ? '<span aria-current="page">' + esc(it[0]) + "</span>" : '<a href="' + esc(it[1]) + '">' + esc(it[0]) + "</a>";
    }).join('<span aria-hidden="true"> / </span>') + "</nav>";
  }
  function faq(d) {
    var s = d.site, tg = d.social.filter(function (x) { return x.platform === "telegram"; })[0];
    if (arr(s.faq).length) return s.faq;
    return [
      { q: "Are the resources on " + s.name + " free?", a: "Yes. Everything listed on " + s.name + " is free to download for personal use." },
      { q: "What can I find here?", a: d.cats.length ? "You can find " + d.cats.map(function (c) { return c.name; }).join(", ") + ". New files are added over time." : "Study notes, ebooks, templates and guides. New files are added over time." },
      { q: "How do I download a file?", a: "Open a resource and press the Download button. Some items open a Google Drive or similar page, where you press download there." },
      { q: "Can I request a resource?", a: s.email ? "Yes. Send a request to " + s.email + (tg ? " or message us on Telegram." : ".") : "Yes. Message us on our social channels." },
      { q: "Can I share these files with friends?", a: "Please share the page link rather than re-uploading the files. Every resource has a share button that copies its link." }
    ];
  }

  // ---------- chrome ----------
  function header(d, ctx, page) {
    var n = d.site.name, here = page === "resource" || page === "category" ? "resources" : page;
    var items = [["Resources", link(ctx, "resources.html"), "resources"]];
    if (d.links.length) items.push(["Websites", link(ctx, "websites.html"), "websites"]);
    items.push(["About", link(ctx, "about.html"), "about"]);
    if (d.social.length) items.push(["Connect", link(ctx, "index.html", "community"), ""]);
    var mono = n.split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join("").toUpperCase() || "RH";
    return '<a class="skip" href="#main">Skip to content</a><header class="bar" id="site-header"><div class="bar-in"><a class="logo" href="' + esc(link(ctx, "index.html")) + '"><span class="mono">' + esc(mono) + "</span><span>" + esc(n) + '</span></a>' +
      '<nav class="mainnav" id="mainnav" aria-label="Main">' + items.map(function (it) { return '<a href="' + esc(it[1]) + '"' + (it[2] && it[2] === here ? ' aria-current="page"' : "") + ">" + esc(it[0]) + "</a>"; }).join("") + "</nav>" +
      '<div class="bar-r"><button id="theme" class="icon-btn" type="button" aria-label="Switch to dark mode" aria-pressed="false">' + ico("moon") + '</button><button class="icon-btn menu-btn" type="button" data-menu aria-label="Open menu" aria-expanded="false" aria-controls="mainnav">' + ico("menu") + "</button></div></div></header>";
  }
  function footer(d, ctx) {
    var s = d.site, links = [["Home", link(ctx, "index.html")], ["Resources", link(ctx, "resources.html")]];
    if (d.links.length) links.push(["Useful websites", link(ctx, "websites.html")]);
    links.push(["How it works", link(ctx, "index.html", "how")], ["About and FAQ", link(ctx, "about.html")]);
    if (d.social.length) links.push(["Connect", link(ctx, "index.html", "community")]);
    var round = d.social.map(function (x) { return '<a class="round" href="' + esc(validUrl(x.url)) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(PLATFORMS[x.platform].label) + '" title="' + esc(PLATFORMS[x.platform].label) + '">' + ico(x.platform) + "</a>"; }).join("") +
      (s.email ? '<a class="round" href="mailto:' + esc(s.email) + '" aria-label="Email" title="Email">' + ico("mail") + "</a>" : "");
    return '<footer class="foot" id="site-footer"><div class="foot-in"><div><h3>' + esc(s.name) + "</h3><p>" + esc(s.description) + "</p><p>Free to use. New files are added regularly.</p></div>" +
      '<div><h3>Quick Links</h3><ul class="ql">' + links.map(function (l) { return '<li><a href="' + esc(l[1]) + '">' + ico("go") + esc(l[0]) + "</a></li>"; }).join("") + "</ul></div>" +
      '<div><h3>Contact Info</h3><ul class="ci">' + (s.email ? '<li>' + ico("mail") + '<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + "</a></li>" : "") + (s.location ? "<li>" + ico("pin") + "<span>" + esc(s.location) + "</span></li>" : "") + "</ul>" +
      '<div class="round-row">' + round + "</div></div></div>" +
      '<div class="foot-bot">Designed with <span class="heart" aria-label="love">\u2665</span> by <b>' + esc(s.author || s.name) + "</b> \u00b7 \u00a9 " + new Date().getFullYear() + "</div></footer>";
  }

  // ---------- pages (main content) ----------
  var HOW = '<section id="how" class="wrap"><h2>How it works</h2><div class="steps">' +
    '<div class="step"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h6"/></svg><h3>Pick a category</h3><p>Choose Study Notes, eBooks, Templates or search for a subject.</p></div>' +
    '<div class="step"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg><h3>Download it</h3><p>Press Download and the file is saved to your device.</p></div>' +
    '<div class="step"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg><h3>Stay updated</h3><p>Join our Telegram, Instagram or Pinterest to see new files first.</p></div>' +
    '</div><p class="how-note">Free for personal use. Share the page link with friends instead of the files.</p></section>';

  var PAGES = {
    index: function (d, ctx) {
      var s = d.site, words = String(s.headline).split(" "), tg = d.social.filter(function (x) { return x.platform === "telegram"; })[0];
      var h1 = words.length > 3 ? esc(words.slice(0, -2).join(" ")) + ' <span class="mark">' + esc(words.slice(-2).join(" ")) + "</span>" : esc(s.headline);
      var stack = d.resources.slice(0, 3).map(function (p) { return '<div class="mini" style="--h:' + hue(p.category) + '"><small>' + esc(p.category) + "</small><b>" + esc(p.title) + "</b><span>" + esc([p.subject, p.type].filter(Boolean).join(" \u00b7 ")) + "</span></div>"; }).join("");
      var o = '<section class="hero"><div class="hero-copy"><h1>' + h1 + "</h1><p>" + esc(s.description) + '</p><div class="cta-row"><a class="btn" href="' + esc(link(ctx, "resources.html")) + '">Browse resources</a>' +
        (tg ? '<a class="btn ghost" href="' + esc(validUrl(tg.url)) + '" target="_blank" rel="noopener noreferrer">Join Telegram</a>' : "") + '</div><ul class="trust"><li>Instant download</li><li>No sign-up</li><li>Free to use</li></ul></div>' +
        (stack ? '<div class="stack" aria-hidden="true">' + stack + "</div>" : "") + "</section>";
      if (d.cats.length) o += '<section id="categories" class="wrap cats"><h2>Browse by category</h2><div class="cat-grid">' + d.cats.map(function (c) { return catTile(c, ctx); }).join("") + "</div></section>";
      o += '<section id="resources" class="wrap"><div class="head"><h2>Featured and new resources</h2><a class="btn ghost" href="' + esc(link(ctx, "resources.html")) + '">View all' + (d.resources.length > 6 ? " " + d.resources.length : "") + " resources</a></div>" +
        (d.resources.length ? '<div class="grid">' + d.resources.slice(0, 6).map(function (p) { return card(p, ctx, true); }).join("") + "</div>" : '<p class="muted">No resources yet. Check back soon.</p>') + "</section>";
      if (d.social.length) o += '<section id="community" class="band"><div class="wrap"><h2>Connect and get updates</h2><p class="sec-sub">Join our community to see new study notes, ebooks and templates the moment they are added.</p><div class="soc-grid">' +
        d.social.slice(0, 6).map(socialCard).join("") + "</div>" + (s.email ? '<p class="req">Looking for something specific? ' + (tg ? "Message us on Telegram or " : "") + '<a href="mailto:' + esc(s.email) + '">send an email</a>.</p>' : "") + "</div></section>";
      o += HOW;
      if (d.links.length) o += '<section id="sites" class="band"><div class="wrap"><div class="head"><div><h2>Useful websites</h2><p class="sec-sub">Handpicked sites I use and recommend.</p></div><a class="btn ghost" href="' + esc(link(ctx, "websites.html")) + '">View all' + (d.links.length > 6 ? " " + d.links.length : "") + ' websites</a></div><div class="sites">' + d.links.slice(0, 6).map(function (l) { return siteCard(l, ctx); }).join("") + "</div></div></section>";
      return o;
    },
    resources: function (d, ctx) {
      var intro = d.cats.length ? "Free downloads: " + d.cats.map(function (c) { return c.name + " (" + c.count + ")"; }).join(", ") + ". Search by title or subject, or filter by category, file type and language." : "No resources yet. Check back soon.";
      return '<div class="page-head"><h1>All resources</h1><p class="intro">' + esc(intro) + '</p><p class="muted" id="count" data-noun="resource">' + d.resources.length + (d.resources.length === 1 ? " resource" : " resources") + "</p></div>" +
        '<section class="wrap pt"><div class="head"><div class="tools"><input id="q" class="search" type="search" placeholder="Search title or subject" aria-label="Search resources"><select id="type" class="select" aria-label="Filter by file type">' + options(uniq(d.resources, "type"), "All types") +
        '</select><select id="lang" class="select" aria-label="Filter by language">' + options(uniq(d.resources, "language"), "All languages") + "</select></div></div>" + (d.cats.length > 1 ? chips(d.cats.map(function (c) { return c.name; }), "Filter by category") : "") +
        '<div id="grid" class="grid">' + d.resources.map(function (p) { return card(p, ctx, false); }).join("") + '</div><p id="empty" class="muted" hidden>Nothing matches your search.</p></section>';
    },
    websites: function (d, ctx) {
      var cats = uniq(d.links, "category");
      return '<div class="page-head"><h1>Useful websites</h1><p class="intro">Handpicked websites for learning, design and productivity.</p><p class="muted" id="count" data-noun="website">' + d.links.length + (d.links.length === 1 ? " website" : " websites") + "</p></div>" +
        '<section class="wrap pt"><div class="head"><div class="tools"><input id="q" class="search" type="search" placeholder="Search websites" aria-label="Search websites"></div></div>' + (cats.length > 1 ? chips(cats, "Filter by category") : "") +
        '<div id="grid" class="sites">' + d.links.map(function (l) { return siteCard(l, ctx); }).join("") + '</div><p id="empty" class="muted" hidden>Nothing matches your search.</p></section>';
    },
    about: function (d, ctx) {
      var s = d.site;
      return '<div class="page-head"><h1>About ' + esc(s.name) + '</h1></div><section class="wrap pt"><div class="about"><p class="intro">' + esc(s.description) + "</p>" +
        (d.cats.length ? "<p>" + esc(s.name) + " is a free library with " + esc(d.cats.map(function (c) { return c.count + " " + c.name; }).join(", ")) + ". Everything can be downloaded without signing up.</p>" : "") +
        "<h2>Frequently asked questions</h2>" + '<div class="faq">' + faq(d).map(function (f) { return "<details><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>"; }).join("") + "</div>" +
        (s.email ? '<h2>Contact</h2><p>Email <a href="mailto:' + esc(s.email) + '">' + esc(s.email) + "</a>" + (s.location ? " (" + esc(s.location) + ")" : "") + ".</p>" : "") + "</div></section>";
    },
    resource: function (d, ctx, p) {
      var cat = d.cats.filter(function (c) { return c.name === p.category; })[0], file = p.source === "file" && safeFile(p.url), href = file ? px(ctx) + file : safeUrl(p.url);
      var facts = [["Category", p.category], ["Subject", p.subject], ["Format", p.type], ["Pages", p.pages], ["Language", p.language], ["File size", size(p.size)], ["Added", fmtDate(p.added)], ["Last updated", fmtDate(p.updated)], ["Price", "Free"]].filter(function (f) { return f[1]; });
      var bits = [p.pages ? p.pages + " pages" : "", p.language, size(p.size)].filter(Boolean);
      var answer = p.title + " is a free " + (p.type || "resource") + (p.subject ? " for " + p.subject : "") + (bits.length ? " (" + bits.join(", ") + ")" : "") + ". You can download it below with no sign-up.";
      var rel = d.resources.filter(function (x) { return x.category === p.category && x.id !== p.id; }).slice(0, 3);
      var btn = file ? '<a class="btn" href="' + esc(href) + '" download="' + esc(p.filename || "") + '" data-dl="1">Download</a>' : '<a class="btn" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" data-dl="1">Get this resource</a>';
      return '<article class="wrap detail">' + crumbs(ctx, [["Home", link(ctx, "index.html")], ["Resources", link(ctx, "resources.html")], [p.category, cat ? catHref(cat, ctx) : link(ctx, "resources.html")], [p.title, ""]]) +
        '<div class="detail-grid"><div><h1>' + esc(p.title) + '</h1><p class="answer">' + esc(answer) + "</p>" + (p.description ? "<p>" + esc(p.description) + "</p>" : "") +
        '<div class="cta-row">' + btn + shareBtn(p.title, "") + '<button class="btn ghost" type="button" data-copy data-href="">Copy link</button></div></div>' +
        '<aside class="facts" aria-label="Details"><h2>Details</h2><dl>' + facts.map(function (f) { return "<dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd>"; }).join("") + "</dl></aside></div>" +
        (rel.length ? '<section class="related"><h2>More in ' + esc(p.category) + '</h2><div class="grid">' + rel.map(function (x) { return card(x, ctx, false); }).join("") + "</div></section>" : "") + "</article>";
    },
    category: function (d, ctx, c) {
      var list = d.resources.filter(function (p) { return p.category === c.name; }), subs = uniq(list, "subject"), others = d.cats.filter(function (x) { return x.name !== c.name; });
      return '<div class="page-head">' + crumbs(ctx, [["Home", link(ctx, "index.html")], ["Resources", link(ctx, "resources.html")], [c.name, ""]]) + "<h1>" + esc(c.name) + '</h1><p class="intro">' + c.count + " free " + esc(c.name) + (c.count === 1 ? " resource" : " resources") + " to download" + (subs.length ? ". Subjects covered: " + esc(subs.join(", ")) : "") + ".</p></div>" +
        '<section class="wrap pt"><div class="grid">' + list.map(function (p) { return card(p, ctx, false); }).join("") + "</div>" +
        (others.length ? '<h2 class="more-h">Other categories</h2><div class="cat-grid">' + others.map(function (x) { return catTile(x, ctx); }).join("") + "</div>" : "") + "</section>";
    },
    notfound: function (d, ctx) {
      return '<section class="wrap" style="text-align:center"><h1>Page not found</h1><p class="muted">This page may have moved or been removed.</p><p><a class="btn" href="' + esc(link(ctx, "index.html")) + '">Go to the homepage</a> <a class="btn ghost" href="' + esc(link(ctx, "resources.html")) + '">Browse resources</a></p></section>';
    }
  };
  function page(name, d, ctx, arg) { return header(d, ctx, name) + '<main id="main">' + PAGES[name](d, ctx, arg) + "</main>" + footer(d, ctx); }

  return { PLATFORMS: PLATFORMS, KNOWN: KNOWN, SPRITE: SPRITE, esc: esc, arr: arr, validUrl: validUrl, safeUrl: safeUrl, safeFile: safeFile, hostOk: hostOk, size: size, fmtDate: fmtDate, isNew: isNew, hue: hue,
    slugify: slugify, canonCat: canonCat, catList: catList, sortResources: sortResources, handle: handle, normalize: normalize, faq: faq, page: page, px: px, link: link, detailHref: detailHref, catHref: catHref };
});
