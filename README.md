# Resource Hub (free downloads site, GitHub Pages + GitHub Actions)

Study notes, ebooks and templates visitors can download. You manage everything from `/admin/`.
Every change you publish is turned into real, search-engine-friendly HTML pages automatically.

## Folder structure
```
.github/workflows/pages.yml   builds and deploys the site (do not delete)
scripts/build.mjs             creates all pages, sitemap.xml, robots.txt, llms.txt, feed.xml
assets/js/render.js           page templates (used by the build and by the admin preview)
assets/js/app.js              search, filters, share, menu, preview
assets/css/styles.css, assets/img/
admin/                        admin panel
data/data.json                all your content (edited by the admin)
files/                        uploaded files, sorted into one folder per category
index.html                    placeholder only; the real pages are generated
```

## One-time setup
1. Create a GitHub repository and upload ALL files and folders of this zip, keeping the structure.
   **Make sure the hidden `.github` folder is uploaded.** If it is missing, create the file in GitHub with
   Add file > Create new file, name it `.github/workflows/pages.yml` and paste the contents from this zip.
2. Repo > **Settings > Pages > Build and deployment > Source: GitHub Actions** (not "Deploy from a branch").
3. Open the **Actions** tab. A "Build and deploy site" run starts (or press "Run workflow"). Wait until it is green.
4. Your site: `https://USERNAME.github.io/REPO/`. Admin: `.../admin/`.
5. Create a fine-grained token (GitHub > Settings > Developer settings > Personal access tokens): only this repo,
   permission **Contents: Read and write**. Paste it in Admin > "GitHub connection".

## Daily use
Add or edit items in the admin and press **Publish to live site**. GitHub rebuilds the whole site (about 1 to 2 minutes).
- **Sample items** (marked SAMPLE) are never shown to visitors. Edit or delete them and add your own.
  A fresh install therefore starts empty until you add real content. "Preview draft" shows everything, samples included.
- Resources are sorted automatically: Featured first, then newest. "New" appears for 14 days after adding.
- Resources and categories get their own pages, so each one can appear in search results.
- Admin > Settings: site name, headline, email, footer location, your name (footer credit), site URL.

## SEO, AEO and GEO: what is built in
**SEO (search engines):** real HTML for every page (not JavaScript-only), one page per resource and per category,
unique titles and descriptions, canonical links, sitemap.xml, robots.txt, Open Graph/Twitter cards, breadcrumbs,
structured data (JSON-LD: Organization, WebSite, CollectionPage, ItemList, DigitalDocument/LearningResource, BreadcrumbList).
**AEO (answer engines, featured snippets, voice):** each resource page starts with a plain "X is a free PDF for Physics (48 pages, English)" sentence
and a facts table; the About page has a visible FAQ with FAQPage markup.
**GEO (AI assistants and AI search):** `llms.txt` (a clean summary of the site for AI tools), consistent facts (name, email, social profiles via `sameAs`),
dates on every item, an Atom feed (`feed.xml`), and robots.txt that allows the main AI crawlers.
To block an AI crawler, open `scripts/build.mjs`, find the `AI` list and remove its name.

**Do this after launch (it matters more than any code):**
1. Use your own domain if possible (Settings > Pages > Custom domain, or put it in Admin > Settings > Site URL). robots.txt only works at the root of a domain,
   so on a `github.io/REPO/` address search engines ignore it. Sitemaps still work.
2. Add the site in **Google Search Console** and **Bing Webmaster Tools** and submit `sitemap.xml`.
3. Write useful, original descriptions for every resource (not one-liners) and fill in subject, pages and language.
4. Replace `assets/img/og-default.png` with your own 1200x630 image.
5. Get a few real links to the site (Telegram channel, Instagram bio, Pinterest boards).
Nobody can guarantee rankings or AI citations. `llms.txt` is a new convention that not every AI system reads yet.

## Important
- Only upload material you created or have permission to share. GitHub can remove repos hosting infringing content.
- Admin uploads are limited to 25 MB each. Use Drive/Telegram links for big ebooks.
- Everything published is public. Never share your token.
- The admin keeps a working copy in your browser and warns you before overwriting changes made elsewhere.
- "Reload from live site" discards the working copy (and can delete files you uploaded but did not publish).
