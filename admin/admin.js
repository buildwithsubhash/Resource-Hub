(function () {
  "use strict";
  var R = window.RENDER, enc = encodeURIComponent;
  var WORK = "rl_work", DIRTY = "rl_dirty", DEL = "rl_deletes", UPL = "rl_uploaded", BASE = "rl_base", CFG_KEY = "rl_gh_cfg", TOK_KEY = "rl_gh_token", DATA_PATH = "data/data.json", MAX = 25 * 1024 * 1024;
  var SITE0 = { name: "Resource Hub", headline: "Free templates, docs and guides you can download today.", description: "Study notes, ebooks and templates, ready to download in one click.", email: "", location: "", url: "", author: "" };
  var data = norm({}), deletes = [], uploaded = [], baseHash = "";
  var $ = function (id) { return document.getElementById(id); };
  document.body.insertAdjacentHTML("afterbegin", R.SPRITE);

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function norm(d) { d = d || {}; return { site: Object.assign({}, SITE0, d.site || {}), social: R.arr(d.social), resources: R.arr(d.resources), links: R.arr(d.links) }; }
  function status(msg, bad) { $("status").textContent = msg; $("status").className = "status" + (bad ? " err" : ""); }
  function setDirty(b) { $("dirty").hidden = !b; try { b ? localStorage.setItem(DIRTY, "1") : localStorage.removeItem(DIRTY); } catch (e) {} }
  function saveAux() { localStorage.setItem(DEL, JSON.stringify(deletes)); localStorage.setItem(UPL, JSON.stringify(uploaded)); }
  function save(msg) { localStorage.setItem(WORK, JSON.stringify(data)); saveAux(); setDirty(true); refresh(); status(msg || "Saved in this browser. Click Publish to put it on the live site."); }
  function b64(s) { return btoa(unescape(encodeURIComponent(s))); }
  function bytesToB64(u8) { var s = "", i, C = 0x8000; for (i = 0; i < u8.length; i += C) s += String.fromCharCode.apply(null, u8.subarray(i, i + C)); return btoa(s); }
  function httpsOk(u) { try { return new URL(u).protocol === "https:"; } catch (e) { return false; } }
  function newId(p) { return p + Date.now().toString(36) + Math.floor(Math.random() * 99); }
  function today() { return new Date().toISOString().slice(0, 10); }
  async function hashText(t) {
    try { var b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join(""); }
    catch (e) { var h = 0; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return "s" + h; }
  }
  function storeName(n) {
    var m = /^(.*?)(\.[A-Za-z0-9]{1,8})?$/.exec(n);
    return ((m[1] || "file").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "file") + "-" + Date.now().toString(36) + (m[2] || "").toLowerCase();
  }
  function detectType(n) {
    var e = ((/\.([A-Za-z0-9]+)$/.exec(n) || [])[1] || "").toLowerCase();
    if (e === "pdf") return "PDF"; if (/^(epub|mobi|azw3)$/.test(e)) return "eBook";
    if (/^(docx?|txt|md|rtf|odt|pages)$/.test(e)) return "Document"; if (/^(xlsx?|csv|ods|numbers)$/.test(e)) return "Spreadsheet";
    if (/^(pptx?|key|odp)$/.test(e)) return "Presentation"; if (/^(zip|rar|7z|tar|gz)$/.test(e)) return "Archive"; if (/^(png|jpe?g|gif|svg|webp)$/.test(e)) return "Image";
    return "Other";
  }

  // ---- generic list (optional reorder) ----
  function listUI(ul, arr, title, sub, edit, remove, movable) {
    ul.textContent = "";
    if (!arr.length) { ul.appendChild(el("li", "muted", "Nothing here yet. Add your first one.")); return; }
    arr.forEach(function (it, i) {
      var li = el("li"), info = el("div"), act = el("div", "actions");
      info.appendChild(el("div", "t", title(it))); info.appendChild(el("div", "m", sub(it)));
      function btn(txt, fn, cls, label) { var b = el("button", "btn ghost small" + (cls || ""), txt); b.type = "button"; if (label) b.setAttribute("aria-label", label); b.addEventListener("click", fn); act.appendChild(b); }
      function swap(a, b) { var t = arr[a]; arr[a] = arr[b]; arr[b] = t; save(); }
      if (movable && i > 0) btn("\u2191", function () { swap(i, i - 1); }, "", "Move up");
      if (movable && i < arr.length - 1) btn("\u2193", function () { swap(i, i + 1); }, "", "Move down");
      if (edit) btn("Edit", function () { edit(it); });
      btn("Delete", function () { if (confirm("Delete \"" + title(it) + "\"?")) remove(it); }, " danger");
      li.appendChild(info); li.appendChild(act); ul.appendChild(li);
    });
  }
  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (x) { x.setAttribute("aria-selected", String(x === t)); });
      document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.dataset.panel !== t.dataset.tab; });
    });
  });

  // ---- GitHub connection ----
  function guess() {
    var m = /^(.+)\.github\.io$/.exec(location.hostname); if (!m) return {};
    var seg = location.pathname.split("/")[1];
    return { owner: m[1], repo: seg && seg !== "admin" && seg !== "index.html" ? seg : m[1] + ".github.io" };
  }
  function loadCfg() {
    var c = {}; try { c = JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch (e) {}
    var g = guess();
    $("ghOwner").value = c.owner || g.owner || ""; $("ghRepo").value = c.repo || g.repo || ""; $("ghBranch").value = c.branch || "main";
    var t = localStorage.getItem(TOK_KEY) || sessionStorage.getItem(TOK_KEY) || "";
    $("ghToken").value = t; $("ghRemember").checked = !!localStorage.getItem(TOK_KEY);
    if (!t) $("gh").open = true;
  }
  function readCfg() { return { owner: $("ghOwner").value.trim(), repo: $("ghRepo").value.trim(), branch: $("ghBranch").value.trim() || "main", token: $("ghToken").value.trim() }; }
  function persistCfg(c) {
    localStorage.setItem(CFG_KEY, JSON.stringify({ owner: c.owner, repo: c.repo, branch: c.branch }));
    localStorage.removeItem(TOK_KEY); sessionStorage.removeItem(TOK_KEY);
    ($("ghRemember").checked ? localStorage : sessionStorage).setItem(TOK_KEY, c.token);
  }
  function api(c, path) { return "https://api.github.com/repos/" + enc(c.owner) + "/" + enc(c.repo) + "/contents/" + path; }
  function hdr(c, json) { var h = { Authorization: "Bearer " + c.token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }; if (json) h["Content-Type"] = "application/json"; return h; }
  var ERRORS = {
    401: "The token is invalid or expired.", 403: "The token cannot write to this repo. It needs Contents: Read and write.",
    404: "Repo or branch not found. Check username, repository and branch (a token without access also shows this).", 409: "The repo changed meanwhile. Try again.",
    413: "The file is too large for GitHub's API. Use an external link instead.", 422: "GitHub rejected the request. Check the branch name."
  };
  function fail(r) { status(ERRORS[r.status] || "GitHub error " + r.status + ".", true); }
  function needCfg() { var c = readCfg(); if (!c.owner || !c.repo || !c.token) { $("gh").open = true; return null; } persistCfg(c); return c; }
  async function ghDelete(c, p) {
    var g = await fetch(api(c, p) + "?ref=" + enc(c.branch), { headers: hdr(c), cache: "no-store" });
    if (g.status === 404) return true; if (!g.ok) { fail(g); return false; }
    var r = await fetch(api(c, p), { method: "DELETE", headers: hdr(c, true), body: JSON.stringify({ message: "Remove file " + p, sha: (await g.json()).sha, branch: c.branch }) });
    if (!r.ok) { fail(r); return false; } return true;
  }
  async function uploadFile(f, cat) {
    if (f.size > MAX) throw new Error("File is over 25 MB. Upload it to Google Drive or Dropbox and use the external link option.");
    var c = needCfg(); if (!c) throw new Error("Fill in the GitHub connection first. Files are uploaded to your repo.");
    var path = "files/" + (R.slugify(cat) || "general") + "/" + storeName(f.name), content = bytesToB64(new Uint8Array(await f.arrayBuffer()));
    var r = await fetch(api(c, path), { method: "PUT", headers: hdr(c, true), body: JSON.stringify({ message: "Add file " + path, content: content, branch: c.branch }) });
    if (!r.ok) throw new Error(ERRORS[r.status] || "Upload failed (" + r.status + ").");
    uploaded.push(path); saveAux(); return path;
  }

  async function publish() {
    var c = needCfg(); if (!c) { status("Fill in the GitHub connection details first.", true); return; }
    $("publish").disabled = true; status("Publishing…");
    try {
      // 1. make sure nobody else changed the live data since this copy was loaded
      var g = await fetch(api(c, DATA_PATH) + "?ref=" + enc(c.branch), { headers: hdr(c), cache: "no-store" }), sha, remoteHash = "";
      if (g.ok) {
        var j = await g.json(); sha = j.sha;
        try { remoteHash = await hashText(JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(j.content.replace(/\n/g, ""))))))); } catch (e) {}
      } else if (g.status !== 404) { fail(g); return; }
      if (baseHash && remoteHash && remoteHash !== baseHash && !confirm("The live data changed since you loaded it (maybe edited on GitHub or another device). Publishing will overwrite those changes. Publish anyway?")) { status("Publish cancelled.", true); return; }
      // 2. remove files that were deleted or replaced
      for (var i = 0; i < deletes.length; i++) if (!(await ghDelete(c, deletes[i]))) return;
      // 3. save the data (this also triggers the site rebuild)
      var body = { message: "Update site content from admin panel", content: b64(JSON.stringify(data, null, 2) + "\n"), branch: c.branch };
      if (sha) body.sha = sha;
      var u = await fetch(api(c, DATA_PATH), { method: "PUT", headers: hdr(c, true), body: JSON.stringify(body) });
      if (!u.ok) { fail(u); return; }
      baseHash = await hashText(JSON.stringify(data)); localStorage.setItem(BASE, baseHash);
      deletes = []; uploaded = []; saveAux(); setDirty(false);
      status("Published. The site is rebuilding and will update in about 1 to 2 minutes." + (sampleCount() ? " Sample items stay hidden from visitors." : ""));
    } catch (e) { status("Network error. Check your connection and try again.", true); }
    finally { $("publish").disabled = false; }
  }
  $("publish").addEventListener("click", publish);

  // ---- Settings ----
  var SITE = { siteName: "name", siteHeadline: "headline", siteDesc: "description", siteEmail: "email", siteLocation: "location", siteAuthor: "author", siteUrl: "url" };
  function fillSite() { Object.keys(SITE).forEach(function (id) { $(id).value = data.site[SITE[id]] || ""; }); }
  Object.keys(SITE).forEach(function (id) {
    $(id).addEventListener("change", function () {
      var v = $(id).value.trim();
      if (id === "siteUrl" && v && !httpsOk(v)) { status("The site URL must start with https://", true); return; }
      data.site[SITE[id]] = v; save("Setting saved. Click Publish to go live.");
    });
  });

  // ---- Resources ----
  var fields = ["title", "description", "subject", "type", "language", "badge"];
  function toggleSource() { var f = $("source").value === "file"; $("fileRow").hidden = !f; $("linkRow").hidden = f; }
  $("source").addEventListener("change", toggleSource);
  $("file").addEventListener("change", function () { var f = this.files[0]; if (f && !$("type").value) $("type").value = detectType(f.name); });
  function queueDelete(p) { if (p && deletes.indexOf(p) < 0) deletes.push(p); }
  function cats() { return data.resources.map(function (p) { return p.category; }).filter(Boolean); }
  function refreshCats() {
    var all = R.KNOWN.concat(cats()), seen = {}, dl = $("catlist"); dl.textContent = "";
    all.forEach(function (c) { var k = c.toLowerCase(); if (seen[k]) return; seen[k] = 1; var o = document.createElement("option"); o.value = c; dl.appendChild(o); });
  }
  function uniqueSlug(title, id) {
    var base = R.slugify(title) || "resource", taken = {};
    data.resources.forEach(function (p) { if (p.id !== id) taken[p.slug || R.slugify(p.title)] = 1; });
    return taken[base] ? base + "-" + (R.slugify(id) || "x") : base;
  }
  function renderResources() {
    var list = R.sortResources(data.resources); $("count").textContent = "(" + list.length + ")";
    listUI($("list"), list, function (p) { return p.title; },
      function (p) { return [p.sample ? "SAMPLE (hidden from visitors)" : "", p.category, p.type, R.size(p.size), p.source === "file" ? "Uploaded file" : "External link", p.featured ? "Featured" : ""].filter(Boolean).join(" \u00b7 "); },
      editRes, function (p) { if (p.source === "file") queueDelete(p.url); data.resources = data.resources.filter(function (x) { return x.id !== p.id; }); save(); resetRes(); }, false);
    refreshCats();
  }
  function editRes(p) {
    $("id").value = p.id; fields.forEach(function (f) { $(f).value = p[f] || ""; }); $("category").value = p.category || ""; $("pages").value = p.pages || ""; $("featured").checked = !!p.featured; $("rights").checked = false;
    $("source").value = p.source || "link"; $("url").value = p.source === "link" ? p.url : ""; $("file").value = "";
    $("curFile").hidden = p.source !== "file"; $("curFile").textContent = p.source === "file" ? "Current file: " + (p.filename || p.url) + ". Choose a new file only to replace it." : "";
    toggleSource(); $("formTitle").textContent = "Edit resource"; $("save").textContent = "Save changes"; $("cancel").hidden = false; $("title").focus();
  }
  function resetRes() { $("form").reset(); $("id").value = ""; $("formErr").textContent = ""; $("curFile").hidden = true; $("formTitle").textContent = "Add resource"; $("save").textContent = "Add resource"; $("cancel").hidden = true; toggleSource(); }
  $("cancel").addEventListener("click", resetRes);
  $("form").addEventListener("submit", async function (e) {
    e.preventDefault(); $("formErr").textContent = "";
    var id = $("id").value, old = data.resources.find(function (x) { return x.id === id; }) || null, nid = id || newId("r");
    var item = { id: nid, title: $("title").value.trim(), description: $("description").value.trim(), category: R.canonCat($("category").value, cats()), subject: $("subject").value.trim(),
      type: $("type").value, language: $("language").value, pages: parseInt($("pages").value, 10) || 0, source: $("source").value, badge: $("badge").value.trim(), featured: $("featured").checked,
      added: old ? (old.added || old.updated || today()) : today(), updated: today() };
    item.slug = old && old.slug ? old.slug : uniqueSlug(item.title, nid); // the web address stays stable when you edit the title
    if (item.source === "link") {
      var u = $("url").value.trim();
      if (!httpsOk(u)) { $("formErr").textContent = "The download link must start with https://"; return; }
      item.url = u; if (!item.type) item.type = "Other"; if (old && old.source === "file") queueDelete(old.url);
    } else {
      var f = $("file").files[0];
      if (f) {
        if (!$("rights").checked) { $("formErr").textContent = "Please confirm you own this file or have permission to share it."; return; }
        $("save").disabled = true; status("Uploading " + f.name + "…");
        try { item.url = await uploadFile(f, item.category); item.size = f.size; item.filename = f.name; if (!item.type) item.type = detectType(f.name); if (old && old.source === "file") queueDelete(old.url); }
        catch (x) { status(x.message, true); $("save").disabled = false; return; }
        $("save").disabled = false;
      } else if (old && old.source === "file") { item.url = old.url; item.size = old.size; item.filename = old.filename; if (!item.type) item.type = old.type || "Other"; }
      else { $("formErr").textContent = "Choose a file to upload."; return; }
    }
    var i = data.resources.findIndex(function (p) { return p.id === item.id; });
    if (i > -1) data.resources[i] = item; else data.resources.push(item);
    save(); resetRes();
  });

  // ---- Websites ----
  function renderLinks() {
    $("lcount").textContent = "(" + data.links.length + ")";
    listUI($("llist"), data.links, function (l) { return l.name; }, function (l) { return (l.sample ? "SAMPLE (hidden) \u00b7 " : "") + l.url; }, editLink,
      function (l) { data.links = data.links.filter(function (x) { return x.id !== l.id; }); save(); resetLink(); }, true);
  }
  function editLink(l) {
    $("lid").value = l.id; $("lname").value = l.name || ""; $("ldesc").value = l.description || ""; $("lurl").value = l.url || ""; $("lcat").value = l.category || "";
    $("lTitle").textContent = "Edit website"; $("lsave").textContent = "Save changes"; $("lcancel").hidden = false; $("lname").focus();
  }
  function resetLink() { $("lform").reset(); $("lid").value = ""; $("lErr").textContent = ""; $("lTitle").textContent = "Add website"; $("lsave").textContent = "Add website"; $("lcancel").hidden = true; }
  $("lcancel").addEventListener("click", resetLink);
  $("lform").addEventListener("submit", function (e) {
    e.preventDefault(); var url = $("lurl").value.trim();
    if (!httpsOk(url)) { $("lErr").textContent = "The link must start with https://"; return; }
    var item = { id: $("lid").value || newId("l"), name: $("lname").value.trim(), description: $("ldesc").value.trim(), url: url, category: $("lcat").value.trim() };
    var i = data.links.findIndex(function (x) { return x.id === item.id; });
    if (i > -1) data.links[i] = item; else data.links.push(item);
    save(); resetLink();
  });

  // ---- Social ----
  Object.keys(R.PLATFORMS).forEach(function (k) { var o = el("option", "", R.PLATFORMS[k].label); o.value = k; $("splatform").appendChild(o); });
  function renderSocial() {
    $("scount").textContent = "(" + data.social.length + ")";
    listUI($("slist"), data.social, function (s) { return (R.PLATFORMS[s.platform] || {}).label || s.platform; }, function (s) { return (s.sample ? "SAMPLE (hidden) \u00b7 " : "") + s.url; }, editSocial,
      function (s) { data.social = data.social.filter(function (x) { return x.id !== s.id; }); save(); resetSocial(); }, true);
  }
  function editSocial(s) { $("sid").value = s.id; $("splatform").value = s.platform; $("surl").value = s.url; $("sTitle").textContent = "Edit social link"; $("ssave").textContent = "Save changes"; $("scancel").hidden = false; $("surl").focus(); }
  function resetSocial() { $("sform").reset(); $("sid").value = ""; $("sErr").textContent = ""; $("sTitle").textContent = "Add social link"; $("ssave").textContent = "Add link"; $("scancel").hidden = true; }
  $("scancel").addEventListener("click", resetSocial);
  $("sform").addEventListener("submit", function (e) {
    e.preventDefault(); var url = $("surl").value.trim(), pf = $("splatform").value;
    if (!httpsOk(url)) { $("sErr").textContent = "The link must start with https://"; return; }
    if (!R.hostOk(pf, url)) { $("sErr").textContent = "This does not look like a " + R.PLATFORMS[pf].label + " link."; return; }
    var item = { id: $("sid").value || newId("s"), platform: pf, url: url };
    var i = data.social.findIndex(function (x) { return x.id === item.id; });
    if (i > -1) data.social[i] = item; else data.social.push(item);
    save(); resetSocial();
  });

  // ---- Backup / reset ----
  $("download").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "data-backup.json"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  });
  $("import").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return; var rd = new FileReader();
    rd.onload = function () { try { var d = JSON.parse(rd.result); if (!d || !Array.isArray(d.resources)) throw 0; data = norm(d); save("Backup imported. Click Publish to go live."); } catch (x) { alert("That file is not a valid backup."); } };
    rd.readAsText(f); e.target.value = "";
  });
  $("reset").addEventListener("click", async function () {
    if (!confirm("Discard your working copy and reload the live data?")) return;
    if (uploaded.length && confirm(uploaded.length + " uploaded file(s) are not published yet. Delete them from your repo too?\n(OK = delete them, Cancel = keep them in the repo)")) {
      var c = needCfg(); if (c) { status("Removing unpublished uploads…"); for (var i = 0; i < uploaded.length; i++) await ghDelete(c, uploaded[i]); }
    }
    [WORK, DIRTY, DEL, UPL, BASE].forEach(function (k) { localStorage.removeItem(k); }); deletes = []; uploaded = []; await init(); status("Reloaded from the live site.");
  });

  function sampleCount() { return [data.resources, data.links, data.social].reduce(function (n, l) { return n + l.filter(function (x) { return x.sample; }).length; }, 0); }
  function refresh() {
    renderResources(); renderLinks(); renderSocial(); fillSite();
    var n = sampleCount(); $("sampleNote").textContent = n ? n + " sample item(s) are hidden from visitors. Edit them (or delete them) and add your own. Use Preview draft to see how they look." : "";
  }
  async function init() {
    loadCfg(); var w = null;
    try { w = JSON.parse(localStorage.getItem(WORK)); } catch (e) {}
    if (w && Array.isArray(w.resources)) {
      data = norm(w); try { deletes = JSON.parse(localStorage.getItem(DEL)) || []; uploaded = JSON.parse(localStorage.getItem(UPL)) || []; } catch (e) { deletes = []; uploaded = []; }
      baseHash = localStorage.getItem(BASE) || ""; setDirty(!!localStorage.getItem(DIRTY));
    } else {
      try { var r = await fetch("../" + DATA_PATH + "?t=" + Date.now(), { cache: "no-store" }); var j = await r.json(); data = norm(j); baseHash = await hashText(JSON.stringify(j)); localStorage.setItem(BASE, baseHash); }
      catch (e) { data = norm({}); baseHash = ""; }
      deletes = []; uploaded = []; setDirty(false);
    }
    refresh(); toggleSource();
  }
  init();
})();
