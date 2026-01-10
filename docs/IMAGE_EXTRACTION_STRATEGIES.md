# 📷 Image Extraction Strategies by Source

This document contains the image extraction techniques for each news source in MIRRIM.
Update this file as you discover new patterns.

---

## ✅ AMI (Agence Mauritanienne d'Information)

**URLs**: `ami.mr/fr`, `ami.mr/ar`

| Strategy | Priority | Reliability | Notes |
|----------|----------|-------------|-------|
| `og:image` meta tag | 1 | ⚠️ 66% | Sometimes returns `default-thumb/large.png` |
| `a[href*="/wp-content/uploads/"]` | 2 | ✅ 100% | The `.post-thumbnail > a` link always works |
| First article `<img>` | 3 | ⚠️ 50% | May catch ads or banners |

**Key selector**: `.post-thumbnail a` → `href` attribute

**Implemented**: ✅ Yes (in `scraper.ts`)

---

## ✅ Kassataya

**URLs**: `kassataya.com`

| Strategy | Priority | Reliability | Notes |
|----------|----------|-------------|-------|
| Featured image (`figure.wp-block-post-featured-image img`) | 1 | ✅ 100% | WordPress canonical source |
| `a[href*="/wp-content/uploads/"]` before article | 2 | ✅ 95% | First link only |
| `og:image` meta tag | 3 | ⚠️ 80% | Social fallback, may be compressed |
| First `article img` | 4 | ⚠️ 50% | Risk of inline images |

**Key selectors**:
- `figure.wp-block-post-featured-image img`
- `figure.post-thumbnail img`
- `div.post-thumbnail img`
- `article a[href*="/wp-content/uploads/"]`

**Implemented**: ✅ Yes (in `imageExtractor.ts`)

---

## ✅ Le Calame

**URLs**: `lecalame.info/?q=node/...`

**Type**: Drupal (not WordPress)

| Strategy | Priority | Reliability | Notes |
|----------|----------|-------------|-------|
| `/sites/default/files/` (original) | 1 | ✅ 100% | Original image, no `/styles/` |
| `/sites/default/files/styles/` | 2 | ⚠️ 90% | Derivative/resized version |
| `<a href="...jpg">Image</a>` link | 3 | ⚠️ 80% | Fallback when no `<img>` |

**Key rules**:
1. **Isolate article container** - `#block-system-main` or main content block
2. **Filter by URL pattern** - Only keep `lecalame.info/sites/default/files/`
3. **Prioritize original** - URLs without `/styles/` over derivatives
4. **Exclude parasites** - Skip URLs with `logo|icon|avatar|banner|ads|pub`

**Implemented**: ✅ Yes (in `imageExtractor.ts`)

---

## ⏳ Sahara Medias

**URLs**: `saharamedias.net`

| Strategy | Priority | Reliability | Notes |
|----------|----------|-------------|-------|
| `og:image` meta tag | 1 | ❓ | To be tested |
| Article image | 2 | ❓ | To be tested |

**Key selector**: `TODO`

**Implemented**: ❌ Not yet

---

## ⏳ Cridem

**URLs**: `cridem.org`

| Strategy | Priority | Reliability | Notes |
|----------|----------|-------------|-------|
| RSS `<enclosure>` | 1 | ❓ | Standard RSS image field |
| `<media:content>` | 2 | ❓ | Media RSS extension |
| Article page scrape | 3 | ❓ | Fallback if RSS has no image |

**Key selector**: `TODO`

**Implemented**: ❌ Not yet

---

## 📝 How to Test a New Source

1. **Open an article page** in browser
2. **Check Developer Tools** → Elements → Search for `og:image`
3. **If og:image exists**, verify it's the actual article image (not a logo)
4. **If no og:image**, look for:
   - `<a href="...">` links with image extensions
   - `<figure>` or `.featured-image` containers
   - First `<img>` in article content
5. **Document the pattern** in this file
6. **Implement** in `imageExtractor.ts`

---

## 🔧 imageExtractor.ts Fallback Order

The current implementation uses this priority:

1. `og:image` (if not containing "default", "logo", "placeholder")
2. `twitter:image`
3. Links containing `/wp-content/uploads/` with image extensions
4. First `<img>` in article selectors

To add source-specific logic, edit `src/lib/imageExtractor.ts`.
