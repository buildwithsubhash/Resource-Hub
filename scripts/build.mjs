// Builds the static site into _site/ : real HTML pages for every resource and category,
// sitemap.xml, robots.txt, llms.txt, feed.xml and structured data (JSON-LD).
// Runs automatically in GitHub Actions every time data/data.json changes. No npm packages needed.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const R = require("../assets/js/render.js");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_site");
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "data/data.json"), "utf8"));
const d = R.normalize(raw, { preview: process.env.INCLUDE_SAMPLES === "1" }); // samples are skipped unless testing
const s = d.site, esc = R.esc;

// ---------- base URL (needed for canonical links, sitemap, structured data) ----------
function baseUrl() {
  let u = String(s.url || "").trim();
  if (!u && fs.existsSync(path.join(ROOT, "CNAME"))) u = "https://" + fs.readFileSync(path.join(ROOT, "CNAME"), "utf8").trim();
  if (!u && process.env.GITHUB_REPOSITORY) {
    const [o, r] = process.env.GITHUB_REPOSITORY.split("/");
    u = r.toLowerCase() === o.toLowerCase() + ".github.io" ? `https://${o.toLowerCase()}.github.io/` : `https://${o.toLowerCase()}.github.io/${r}/`;
  }
  return /^https:\/\//.test(u) ? u.replace(/\/*$/, "/") : "";
}
const BASE = baseUrl();
const abs = (p) => (BASE ? BASE + p : p);
// Page titles: keep the brand only when it fits, so the title never gets cut in the middle of a word.
const fit = (main, brand, n = 62) => (`${main} | ${brand}`.length <= n ? `${main} | ${brand}` : trim(main, n));
const trim = (t, n) => (t.length > n ? t.slice(0, n - 1).trimEnd() + "\u2026" : t);
const dateOf = (p) => p.updated || p.added || "";
const latest = d.resources.map(dateOf).filter(Boolean).sort().pop() || new Date().toISOString().slice(0, 10);
const iso = (x) => (x ? new Date(x + "T00:00:00Z").toISOString() : new Date().toISOString());
if (!BASE) console.warn("WARNING: no site URL known. Set it in Admin > Settings. Canonical links, sitemap and feed are skipped.");

// ---------- output helpers ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const write = (rel, text) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
for (const dir of ["assets", "admin", "data", "files"]) if (fs.existsSync(path.join(ROOT, dir))) fs.cpSync(path.join(ROOT, dir), path.join(OUT, dir), { recursive: true });
if (fs.existsSync(path.join(ROOT, "CNAME"))) fs.copyFileSync(path.join(ROOT, "CNAME"), path.join(OUT, "CNAME"));

const THEME = `<script>try{var t=localStorage.getItem("rl_theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}</script>`;
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">`;

function doc(m, body) {
  const P = m.prefix != null ? m.prefix : m.depth ? "../" : "";
  const url = m.path != null && BASE ? BASE + m.path : "";
  const img = BASE ? BASE + "assets/img/og-default.png" : P + "assets/img/og-default.png";
  const lead = d.social[0];
  const attrs = `data-page="${m.page}"` + (lead ? ` data-lead-url="${esc(lead.url)}" data-lead-platform="${esc(lead.platform)}"` : "");
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.desc)}">
${url ? `<link rel="canonical" href="${esc(url)}">` : ""}
${m.noindex ? '<meta name="robots" content="noindex">' : ""}
<meta name="theme-color" content="#2b4eff">
<meta property="og:site_name" content="${esc(s.name)}">
<meta property="og:locale" content="en_IN">
<meta property="og:type" content="${m.type || "website"}">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.desc)}">
${url ? `<meta property="og:url" content="${esc(url)}">` : ""}
<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(m.title)}">
<meta name="twitter:description" content="${esc(m.desc)}">
<meta name="twitter:image" content="${esc(img)}">
<link rel="icon" href="${P}assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${P}assets/img/icon-512.png">
${BASE ? `<link rel="alternate" type="application/atom+xml" title="${esc(s.name)}" href="${P}feed.xml">` : ""}
${THEME}
${FONTS}
<link rel="stylesheet" href="${P}assets/css/styles.css">
${m.ld ? `<script type="application/ld+json">${JSON.stringify(m.ld).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body ${attrs}>
${R.SPRITE}
<div id="app">${body}</div>
<script src="${P}assets/js/theme.js"></script>
<script src="${P}assets/js/app.js"></script>
</body>
</html>
`;
}

// ---------- structured data ----------
const ORG = { "@type": "Organization", "@id": abs("#organization"), name: s.name, url: abs(""), logo: abs("assets/img/icon-512.png"),
  ...(s.email ? { email: s.email } : {}), ...(d.social.length ? { sameAs: d.social.map((x) => x.url) } : {}) };
const SITE = { "@type": "WebSite", "@id": abs("#website"), name: s.name, url: abs(""), description: s.description, inLanguage: "en-IN", publisher: { "@id": ORG["@id"] } };
const graph = (...nodes) => ({ "@context": "https://schema.org", "@graph": nodes });
const crumbs = (items) => ({ "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it[0], ...(it[1] != null ? { item: abs(it[1]) } : {}) })) });
const itemList = (list) => ({ "@type": "ItemList", itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`resources/${p.slug}.html`), name: p.title })) });
const LANG = { English: "en", Hindi: "hi", Hinglish: "hi-Latn" };
const MIME = { pdf: "application/pdf", epub: "application/epub+zip", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", zip: "application/zip" };
const lastOf = (list) => list.map(dateOf).filter(Boolean).sort().pop() || latest;
const pages = []; // for sitemap: [path, lastmod]

// ---------- home ----------
write("index.html", doc({ page: "index", path: "", title: trim(`${s.name}: ${s.headline}`.replace(/\.$/, ""), 70), desc: trim(s.description, 158), ld: graph(ORG, SITE) }, R.page("index", d, { depth: 0 })));
pages.push(["", latest]);

// ---------- listings ----------
const catNames = d.cats.map((c) => c.name).join(", ");
write("resources.html", doc({ page: "resources", path: "resources.html", title: fit("All free resources", s.name),
  desc: trim(d.cats.length ? `Free ${catNames} to download. Search by title or subject and filter by file type and language.` : s.description, 158),
  ld: graph(ORG, SITE, { "@type": "CollectionPage", name: `All resources | ${s.name}`, url: abs("resources.html"), isPartOf: { "@id": SITE["@id"] }, mainEntity: itemList(d.resources) }, crumbs([["Home", ""], ["Resources", null]])) }, R.page("resources", d, { depth: 0 })));
pages.push(["resources.html", latest]);
if (d.links.length) {
  write("websites.html", doc({ page: "websites", path: "websites.html", title: fit("Useful websites", s.name), desc: "Handpicked websites for learning, design and productivity, each with a one-line description.",
    ld: graph(ORG, SITE, { "@type": "CollectionPage", name: `Useful websites | ${s.name}`, url: abs("websites.html"), isPartOf: { "@id": SITE["@id"] } }, crumbs([["Home", ""], ["Useful websites", null]])) }, R.page("websites", d, { depth: 0 })));
  pages.push(["websites.html", latest]);
}
write("about.html", doc({ page: "about", path: "about.html", title: fit("About and FAQ", s.name), desc: trim(`About ${s.name}: ${s.description}`, 158),
  ld: graph(ORG, SITE, { "@type": "AboutPage", name: `About ${s.name}`, url: abs("about.html"), isPartOf: { "@id": SITE["@id"] } },
    { "@type": "FAQPage", mainEntity: R.faq(d).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }, crumbs([["Home", ""], ["About", null]])) }, R.page("about", d, { depth: 0 })));
pages.push(["about.html", latest]);

// ---------- category pages ----------
for (const c of d.cats) {
  const list = d.resources.filter((p) => p.category === c.name), pth = `category/${c.slug}.html`;
  write(pth, doc({ page: "category", depth: 1, path: pth, title: fit(`${c.name}: ${c.count} free ${c.count === 1 ? "download" : "downloads"}`, s.name),
    desc: trim(`${c.count} free ${c.name} to download${list.some((p) => p.subject) ? ". Subjects: " + [...new Set(list.map((p) => p.subject).filter(Boolean))].join(", ") : ""}.`, 158),
    ld: graph(ORG, SITE, { "@type": "CollectionPage", name: c.name, url: abs(pth), isPartOf: { "@id": SITE["@id"] }, mainEntity: itemList(list) }, crumbs([["Home", ""], ["Resources", "resources.html"], [c.name, null]])) }, R.page("category", d, { depth: 1 }, c)));
  pages.push([pth, lastOf(list)]);
}

// ---------- one page per resource ----------
for (const p of d.resources) {
  const pth = `resources/${p.slug}.html`, cat = d.cats.find((c) => c.name === p.category);
  const ext = (/\.([A-Za-z0-9]+)$/.exec(p.url || "") || [])[1], file = p.source === "file" && R.safeFile(p.url);
  const desc = trim(`${p.description || p.title} Free ${p.type || "download"}${p.pages ? ", " + p.pages + " pages" : ""}${p.language ? ", " + p.language : ""}. No sign-up needed.`, 158);
  const node = { "@type": ["DigitalDocument", "LearningResource"], "@id": abs(pth + "#resource"), name: p.title, description: p.description || undefined, url: abs(pth), image: abs("assets/img/og-default.png"),
    isAccessibleForFree: true, inLanguage: LANG[p.language], datePublished: p.added || undefined, dateModified: dateOf(p) || undefined, learningResourceType: p.category,
    teaches: p.subject || undefined, about: p.subject ? { "@type": "Thing", name: p.subject } : undefined, encodingFormat: file && ext ? MIME[ext.toLowerCase()] : undefined,
    contentUrl: file ? abs(p.url) : undefined, isPartOf: { "@id": SITE["@id"] }, publisher: { "@id": ORG["@id"] }, author: s.author ? { "@type": "Person", name: s.author } : { "@id": ORG["@id"] } };
  write(pth, doc({ page: "resource", depth: 1, path: pth, type: "article", title: fit(`${p.title}${p.type ? ` (${p.type})` : ""}: free download`, s.name, 65), desc,
    ld: graph(ORG, SITE, node, crumbs([["Home", ""], ["Resources", "resources.html"], [p.category, cat ? `category/${cat.slug}.html` : "resources.html"], [p.title, null]])) }, R.page("resource", d, { depth: 1 }, p)));
  pages.push([pth, dateOf(p) || latest]);
}

// ---------- 404 ----------
write("404.html", doc({ page: "notfound", prefix: BASE, noindex: true, title: `Page not found | ${s.name}`, desc: "This page could not be found.", ld: null }, R.page("notfound", d, { prefix: BASE })));

// ---------- sitemap, robots, llms.txt, feed ----------
if (BASE) {
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map(([p, m]) => `  <url><loc>${esc(abs(p))}</loc><lastmod>${esc(m)}</lastmod></url>`).join("\n") + `\n</urlset>\n`);
  const items = [...d.resources].sort((a, b) => String(b.added || b.updated).localeCompare(String(a.added || a.updated))).slice(0, 20);
  write("feed.xml", `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>${esc(s.name)}</title>\n  <subtitle>${esc(s.description)}</subtitle>\n  <link href="${esc(BASE)}"/>\n  <link rel="self" href="${esc(abs("feed.xml"))}"/>\n  <id>${esc(BASE)}</id>\n  <updated>${iso(latest)}</updated>\n` +
    items.map((p) => `  <entry>\n    <title>${esc(p.title)}</title>\n    <link href="${esc(abs(`resources/${p.slug}.html`))}"/>\n    <id>${esc(abs(`resources/${p.slug}.html`))}</id>\n    <updated>${iso(dateOf(p))}</updated>\n    <summary>${esc(p.description || p.title)}</summary>\n  </entry>`).join("\n") + `\n</feed>\n`);
}
const AI = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot-Extended"];
write("robots.txt", `# Everything is open to search engines and AI answer engines.\n# To block one AI crawler, change its "Allow: /" to "Disallow: /".\nUser-agent: *\nAllow: /\n\n` +
  AI.map((b) => `User-agent: ${b}\nAllow: /\n`).join("\n") + (BASE ? `\nSitemap: ${abs("sitemap.xml")}\n` : ""));

const L = [];
L.push(`# ${s.name}`, "", `> ${s.description}`, "",
  `${s.name} is a free library${d.cats.length ? " of " + catNames : ""}. Everything can be downloaded for personal use without signing up.${s.email ? " Contact: " + s.email + "." : ""}`, "", "## Main pages",
  `- [Home](${abs("")}): overview, categories and newest resources`, `- [All resources](${abs("resources.html")}): every downloadable file with search and filters`);
if (d.links.length) L.push(`- [Useful websites](${abs("websites.html")}): handpicked sites with one-line descriptions`);
L.push(`- [About and FAQ](${abs("about.html")}): what this site is and answers to common questions`, "");
if (d.cats.length) { L.push("## Categories"); for (const c of d.cats) L.push(`- [${c.name}](${abs(`category/${c.slug}.html`)}): ${c.count} free ${c.count === 1 ? "resource" : "resources"}`); L.push(""); }
if (d.resources.length) {
  L.push("## Resources");
  for (const p of d.resources.slice(0, 200)) L.push(`- [${p.title}](${abs(`resources/${p.slug}.html`)}): ${[p.category, p.subject, p.type, p.pages ? p.pages + " pages" : "", p.language].filter(Boolean).join(", ")}. ${p.description || ""}`.trim());
  L.push("");
}
if (BASE) L.push("## Optional", `- [Sitemap](${abs("sitemap.xml")})`, `- [Atom feed](${abs("feed.xml")})`, "");
write("llms.txt", L.join("\n"));

console.log(`Built ${pages.length} pages (${d.resources.length} resources, ${d.cats.length} categories, ${d.links.length} websites, ${d.social.length} social) -> _site/  base: ${BASE || "(none)"}`);
