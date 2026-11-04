<!-- Source of truth: this file in /var/www/gpstoolset/docs/ (repo). Older /workspace copies may lag. -->

# GPS Toolset · Design direction
**Site:** gpstoolset.com · **Author:** Design & UX · **Date:** 2026-11-01 (Europe/Tallinn)  
**Updated:** 2026-11-02 (no accent stripes, minimal shadow, no contact/email; corrected 09:57) · **Status:** Handoff for Cursor (site not built yet) · **Layout:** full-screen map tools (Paul 2026-11-01) · **Source plan:** `/workspace/gpstoolset/manager/plan.md`

---

## Rules (Paul, 2026-11-02)

- **Default separation = spacing, background tints and type.** Thin neutral borders (`--border`, 1px, low contrast) are fine where useful: inputs, cards, drop zone.
- **No accent stripes:** no thick or coloured single-side borders (e.g. coloured `border-left` on cards/callouts).
- **Drop zone:** thin neutral `--border` (dashed or solid; never coloured or thick). **Drag-over = background colour change only.**
- **Shadows: keep minimal.** At most one subtle token (`--shadow-float`), only for floating map chips/popovers, next to the `--surface-float` fill.
- **Focus (keyboard):** tint change + 2px underline; no coloured ring needed.
- **Route white halo stays** — it is a map line stroke, not a UI border.
- **No contact page and no email address anywhere** (footer, about, errors, etc.).
- Privacy/About links **footer only** (not topbar, not homepage mid-links).
- OSM © attribution **on the map only** (Leaflet via tile module). **No** © OSM in the site footer. **No** “Report a map issue” anywhere.

---

## 1. Look & feel

**Three words:** **Clear · Private · Practical**

| Word | Why |
|------|-----|
| **Clear** | Maps and numbers first; chrome stays quiet. Broad audience, no jargon wallpaper. |
| **Private** | Promise is the product: **your file never leaves your device**. Badge on every tool page. |
| **Practical** | Drop a file → see the map. No accounts, no upload theater, no brand cosplay. |

**Vibe:** calm utility (OS map + teal trust), not gaming, not skydive-branded, not “pro dashcam neon.”  
**Brand hygiene:** no brand names in logo/URLs/product copy. GoPro/DJI only as compatibility (“works with GoPro files”). Never name FlySight; say **GNSS logger CSV exports**.

---

## 2. Design tokens

Put all of these in one shared file, e.g. `public/assets/css/tokens.css` (or `:root` in `base.css`). Dark via `[data-theme="dark"]` (also follow `prefers-color-scheme` on first visit).

### Colors (hex) — text contrast ≥ 4.5:1 verified

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--bg` | `#f6f7f9` | `#0b1220` | Page |
| `--surface` | `#ffffff` | `#141c2b` | Cards, panels |
| `--surface-2` | `#eef1f5` | `#1a2436` | Nested / hover fill, inputs |
| `--surface-3` | `#e2e7ee` | `#22304a` | Pressed / selected, drag-over, dividing bands |
| `--surface-float` | `rgba(255,255,255,.96)` | `rgba(20,28,43,.96)` | Map chips/popovers (+ `--shadow-float`) |
| `--border` | `#e3e7ed` | `#222c3d` | 1px neutral, low contrast: inputs, cards, drop zone |
| `--text` | `#0f172a` | `#e8eef7` | Body (16.7:1 / 16.1:1 on bg) |
| `--text-muted` | `#475569` | `#94a3b8` | Secondary (7.1:1 / 7.3:1) |
| `--brand` | `#115e59` | `#2dd4a0` | Primary buttons, header accent, privacy badge |
| `--brand-hover` | `#0f766e` | `#5eead4` | Hover |
| `--accent` | `#c2410c` | `#fb923c` | Secondary CTA, selected map state |
| `--link` | `#0369a1` | `#7dd3fc` | Links, focus underline base |
| `--success` | `#166534` | `#4ade80` | Valid / done |
| `--danger` | `#b91c1c` | `#f87171` | Errors |
| `--focus` | `#0369a1` | `#7dd3fc` | Focus underline (2px) + `--surface-3` tint |
| `--drop-active` | `#d6ecea` | `#123b38` | Drop zone / overlay drag-over background |
| `--overlay` | `rgba(15,23,42,.55)` | `rgba(0,0,0,.65)` | Drop overlay |

**Do not** put body text in `--accent` on light without checking; `#c2410c` on white is ~5.2:1 (OK for large/CTA labels). Prefer white text on solid `--brand` / `--accent` buttons.

### Map route / markers (contrast on OSM street tiles)

| Role | Color | Notes |
|------|-------|-------|
| Route stroke | `#0369a1` | 4px; **white 2px halo** under stroke (reads on light + dark tiles) |
| Route selected / hover | `#c2410c` | Same halo |
| Start pin | `#115e59` | White glyph + white halo ring (map marker, like route halo) |
| End pin | `#b91c1c` | White glyph + white halo ring (map marker, like route halo) |
| Waypoint / click | `#475569` | |
| Chart ↔ map link | Match route; hover uses selected |

### Type

```css
--font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace; /* coords, speeds */
```

| Token | Size | Line | Use |
|-------|------|------|-----|
| `--text-xs` | 0.75rem (12px) | 1.4 | Captions, ad labels |
| `--text-sm` | 0.875rem (14px) | 1.45 | Meta, chart ticks |
| `--text-base` | 1rem (16px) | 1.5 | Body (min) |
| `--text-lg` | 1.125rem (18px) | 1.45 | Lead |
| `--text-xl` | 1.375rem (22px) | 1.3 | Section heads |
| `--text-2xl` | 1.75rem (28px) | 1.2 | Page H1 |
| `--text-3xl` | 2.25rem (36px) | 1.15 | Home hero only |

Weight: 400 body · 600 headings/buttons. Support `[data-text-size="large"]` → bump base to 1.125rem.

### Spacing, radius, shadow, motion

| Token | Value |
|-------|-------|
| `--space-1` … `--space-8` | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 px |
| `--radius-sm` | 6px |
| `--radius` | 10px |
| `--radius-lg` | 16px |
| `--shadow-float` | `0 1px 3px rgba(15,23,42,.08)` — map chips/popovers only |
| `--tap-min` | 44px |
| `--header-h` | **48px** (mobile, + safe-area-top) / 56px (desktop) — slim bar only |
| `--graph-dock-min` | 120px |
| `--graph-dock-max` | 45vh desktop / **40vh** mobile |
| `--graph-dock-default` | 180px |
| Motion | 150–200ms ease; honor `prefers-reduced-motion: reduce` (no pulse, no slide) |

---

## 3. Home page layout

**Job:** one drop → right tool; else browse tools + trust + guides.

```
┌──────────────────────────────────────────────┐
│  [Logo GPS Toolset]     Tools  Guides  About │
├──────────────────────────────────────────────┤
│  H1: Free GPS tools. Files stay on your      │
│  Sub: No upload. No account. Browser only.   │
│  ┌────────────────────────────────────────┐  │
│  │     BIG DROP ZONE (or click browse)    │  │
│  │   Drop GPX · KML · FIT · GoPro video   │  │
│  │   → auto-routes by MIME / extension    │  │
│  └────────────────────────────────────────┘  │
│  [🔒 Your file never leaves your device]     │
│                                              │
│  Tool grid (cards)                           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                 │
│  │GoPro│ │GPX │ │My  │ │Meas│ …              │
│  └────┘ └────┘ └────┘ └────┘                 │
│                                              │
│  Featured guides (3 cards)                   │
│  ─── ad slot A (home mid, reserved) ───      │
│  Footer: Privacy · About · OSM               │
└──────────────────────────────────────────────┘
```

**Auto-route table (home drop):**

| File | Route to |
|------|----------|
| `.mp4` / `.lrv` (GoPro) | `/gopro-gps-extract` |
| `.gpx` | `/gpx-viewer` |
| `.kml` | `/kml-viewer` |
| `.kmz` | `/kmz-viewer` |
| `.fit` | `/fit-viewer` |
| Ambiguous / multi | Modal: “Open with…” tool list |
| Unknown | Inline error + link to `/guides/gps-file-formats` |

**Privacy badge:** teal-tint pill (brand-tint fill, no coloured border), lock icon + exact line **“Your file never leaves your device.”** On home/guides: under the H1. On full-screen map tools: in the menu drawer + empty-state chip (no permanent H1).

---

## 4. Tool page template

**Model:** Google Maps / ADS-B Exchange globe — **full-screen map** minus one slim top bar. The track dominates. **No** permanent 360px side panel. **No** mobile bottom sheet for tools/stats.

### Desktop (≥960px)

```
┌─ slim top bar (56px): [Logo] ………… [☰ Menu] ─┐
│┌─────────────────────────────────────────────┐│
││                                             ││
││              FULL-SCREEN MAP                ││
││         (track dominates viewport)          ││
││                                             ││
││  floating chips (collapsible, edge-docked): ││
││   · Open / Replace file                     ││
││   · Stats popover (distance, elev, …)       ││
││   · Tools / Export / Units popovers         ││
││   · Graph toggles: [Speed] [Altitude] …     ││
││  map controls: ⊕⊖ · locate · layers         ││
││  empty state: centered card over map        ││
││  drop: whole-map overlay on drag            ││
│└─────────────────────────────────────────────┘│
│═ drag handle ═  GRAPH DOCK (optional) ════════│
│  tabs/stack: Speed | Altitude | …             │
│  (map SHRINKS above; charts never overlay)    │
└───────────────────────────────────────────────┘
```

### Mobile (<960px)

```
┌─ top bar ~48px + safe-area-top ──────────────┐
│ [Logo]                              [☰]      │
├──────────────────────────────────────────────┤
│                                              │
│           FULL-SCREEN MAP                    │
│   (fills rest of viewport above dock)        │
│                                              │
│  thumb-zone controls (right/bottom edge):    │
│   ⊕⊖ · file · stats · tools · graph toggles  │
│  empty: centered over map                    │
│  + safe-area-left/right/bottom on controls   │
├─═ drag handle ═ graph dock (max ~40vh) ──────┤
│  Speed / Altitude (tabs or stacked)          │
└──────────────────────────────────────────────┘
```

**Never:** permanent side panel · bottom sheet for chrome · ads covering the map · sticky UI over the track by default.

### Floating map chrome (replaces side panel)

| Control | Behavior |
|---------|----------|
| **Stats chip** | Compact summary (dist, time, elev↑); tap → popover with full `StatsList`. Collapsed by default after first load with a file. |
| **Tools / Edit** | Popover or compact toolbar: Split · Trim · Simplify · Reverse · Elev. fix (`/gpx-viewer`). ≥44px hits. |
| **Export** | Popover: GPX / CSV / … |
| **Units** | Toggle in menu or chip; persists (see UI state below). |
| **Open / Replace** | Chip top-left; Sample in empty state. |
| **Privacy** | One-liner in ☰ menu (and empty-state). |

Chips sit on map edges with solid `--surface-float` fill + subtle `--shadow-float`; **never** cover the fitted track by default (fitBounds padding accounts for chip insets: ~72px sides / 96px bottom when chips visible).

### Graph dock (under map — not overlay)

1. Toggle buttons on the map open/close each series (Speed, Altitude, …).  
2. Open graphs **dock under the map**; the map **shrinks** — charts never float over tiles.  
3. **Drag handle** on the dock top edge resizes height (touch-friendly, ≥24px hit).  
4. **Min** `--graph-dock-min` (120px) · **Max** 45vh desktop / **40vh** mobile · default 180px.  
5. Several open → **tabs** (preferred) or vertical stack inside the dock.  
6. Chart hover ↔ **scrub marker** on the track (shared point index).  
7. Persist open/height in `localStorage` (schema below).

### UI state · `localStorage` key `gpstoolset.ui.v1`

```json
{
  "units": "metric",
  "graphs": {
    "speed":     { "open": false, "height": 180 },
    "altitude":  { "open": false, "height": 180 },
    "heartRate": { "open": false, "height": 180 }
  },
  "dock": {
    "height": 180,
    "tab": "speed"
  },
  "chips": {
    "statsOpen": false,
    "toolsOpen": false
  },
  "view": "map",
  "videoOverlay": {
    "miniMap": true,
    "speed": true,
    "altitude": true,
    "distance": true,
    "time": true,
    "gForce": false,
    "verticalSpeed": false
  }
}
```

- One shared `dock.height` when tabs share one dock; per-graph `height` used if stacked mode is on.  
- Unknown keys ignored; migrate by bumping to `gpstoolset.ui.v2` if breaking.  
- Units also readable from `units` here (single source).


### Video view (GoPro tool — after a file is loaded)

`/gopro-gps-extract` offers two views once a video is loaded (toggle in top bar / chip bar):

1. **Map view** — full-screen map + under-map graph dock (current shell).
2. **Video view** — the user’s video full-screen via **object URL** (no upload), with overlays:
   - **Mini map** (Leaflet via central tile module): track + current-position marker
   - **Metrics** (each toggleable): speed, altitude, distance, time; optional G / vertical speed when present
   - Overlay on/off + which view persist in `gpstoolset.ui.v1` (`view`, `videoOverlay`)
   - Sync to `video.currentTime` using GPMF sample timestamps **relative to video start** (not GPS wall clock)
   - Before first valid GPS fix: show “Waiting for GPS fix”, hide marker; skip invalid samples; interpolate between valid samples
   - Handle seek / pause / play / `playbackRate`; Fullscreen API button; mobile-friendly

Pre-upload: drop zone first; **rich SEO content below** (intro, how-it-works, what you get, supported cameras as compatibility, privacy, FAQ, links). Content **hides after load**. Mention the Video view in that copy. Privacy line OK in empty state; **not** in the header after load.

### Toolbar / map controls

- **On map (right):** Zoom ± · My location (where relevant) · Layers (if any).  
- **On map (left / bottom-left, thumb-reachable on mobile):** File · Stats · Tools · Export · graph toggles.  
- Editor tools only on `/gpx-viewer` (and similar).

### File drop UX (shared component)

1. **Whole-map drop overlay** on `dragenter` (dim map + “Drop to open”; drag-over = background tint `--drop-active` only, no colour/border change); empty card has thin neutral `--border`) — covers the map surface, not a tiny zone.  
2. Empty state: **centered card over the map** — Drop / Choose file · Sample · privacy line.  
3. Click empty card or Open chip → native file picker.  
4. Progress: determinate bar on the empty card or a slim top-of-map toast; cancel if long (GoPro).  
5. Errors: red callout on the centered card + “Try another” + guide link.  
6. Multiple files: queue chip list; one active; show 5 + “+N”.  
7. After success: empty card dismisses; **Replace file** chip remains.

### Empty states

| State | Copy (short) |
|-------|----------------|
| No file | “Drop a file or choose one. Nothing is uploaded.” (centered on map) |
| No GPS in video | “No GPS track in this file.” + tips |
| Geo denied | “Location blocked. Click the map instead.” (`/my-coordinates`) |
| Parse fail | “Couldn’t read that file.” + formats guide |

### Keyboard + a11y

- Focus visible on all controls + chips: `--surface-3` tint + 2px `--focus` underline (no coloured ring).  
- Empty card / drop: `role="button"`, Enter/Space opens picker.  
- Map not the only path — Stats popover + graph dock expose numbers; min/avg/max table alternative for charts.  
- Charts: `aria-label`; dock handle `role="separator"` + arrow keys resize.  
- Skip link: “Skip to map”.  
- Color not sole cue (selected route also thicker).  
- `prefers-reduced-motion` respected.  
- Safe-area insets on mobile for top bar and edge controls.

---

## 5. Map UX

| Item | Spec |
|------|------|
| Tiles | **One** shared module (URL, attribution, maxZoom, subdomains). OSM street only at launch. Attribution always visible. |
| Controls | Zoom ± top-right; attribution bottom-right; scale bottom-left; tool chips opposite thumb edge. |
| Route | Polyline `#0369a1` + white halo; selected segment `#c2410c`. |
| Markers | Start/end as above; click-to-place uses waypoint style; **scrub marker** while chart-hovering. |
| Fit bounds | On load + after edit; padding accounts for floating chips (~72px sides / 96px bottom). |
| Chart link | Graphs dock **under** map (map shrinks). Hover chart ↔ scrub marker on track. Shared index = point i. |
| Units | Global **metric / imperial** in `gpstoolset.ui.v1`. |
| Performance | Simplify display polyline >10k pts (keep full data for export). Invalidate map size on dock resize. |

**Non-map tools** (`/coordinate-converter`, pure converters): normal document layout (not full-screen map); ads allowed. Optional “Preview on map” if coords exist.

---

## 6. Ad slots (centralized partial; **off** until monetization)

**Rules:**  
- **Full-screen map viewer/tool pages** (`/gopro-gps-extract`, `/gpx-viewer`, `/my-coordinates`, `/measure-distance`, `/antipodes`, and later map overlays): **no ads on the map**. Prefer **zero ads** on these pages. If monetizing later, only a **slim** unit that never covers tiles — e.g. inside the **graph dock** when open, or a discreet row inside the **☰ menu** drawer. Never sticky over controls or the track.  
- **Home, guides, converters, about/privacy:** normal document ads OK.  
- Label visually: “Advertisement” 11–12px muted.  
- `ads.enabled=false` → render nothing (collapse; no CLS boxes at launch).

| Slot ID | Where | Desktop | Mobile | Pages |
|---------|--------|---------|--------|-------|
| `ad-home-mid` | Home, after tool grid | 728×90 or fluid 970×90 | 320×100 / 300×250 | `/` |
| `ad-footer` | Above footer links | ≤728×90 fluid | 320×100 | Home, guides, converters, static |
| `ad-guides-in` | Guides, after 2nd section | 728×90 | 300×250 | `/guides/*` |
| `ad-converter-mid` | Converter pages, below result | 728×90 | 320×100 | `/convert`, `/convert/kml-to-gpx`, `/convert/gpx-to-kml`, `/convert/fit-to-gpx`, `/coordinate-converter` |
| `ad-graph-dock` | **Optional**, inside graph dock chrome when dock open | slim ≤728×90 | 320×50 | Map tools only — **off by default**; never if dock closed |
| `ad-menu` | **Optional**, bottom of ☰ drawer | fluid | fluid | Map tools only — **off by default** |

**Removed:** `ad-panel` (no side panel).  
**Max per page:** **2** on document pages; **0** on map tools at launch (later at most **1** of `ad-graph-dock` **or** `ad-menu`, never both with a footer on the same map page).  
**Implementation:** one PHP partial + config; pages call `render_ad('slot-id')`. Map tool templates omit footer ad slots.

**Launch recommendation:** `ads.enabled = false`. When enabling, turn on home/guides/converter slots first; leave map-tool slots false until proven they don’t hurt UX.

---

## 7. Logo / brand

**Wordmark:** “GPS Toolset” — system sans, weight 600; “GPS” in `--brand`, “Toolset” in `--text`.

### Three name-mark ideas (SVG-able, 24–32px)

| ID | Mark | Sketch |
|----|------|--------|
| **A · Pin + wrench** | Map pin whose body is a small wrench cutout | Toolkit + location; clearest metaphor |
| **B · Pin + hash** | Classic pin with `#` / grid cross in the head | Coordinates / measure |
| **C · Track tick** | Pin + short polyline through the point | Routes / GPX feel |

**Pick for launch:** **A** (reads at favicon size). Monochrome brand teal; white knockout on dark header optional.

**Favicon:** 32×32 + 16×16 PNG/SVG — mark only, no word.  
**Apple touch:** 180×180, brand fill + white mark.  
**OG image (1200×630):** cream/gray bg · large mark · wordmark · tagline “Free GPS tools. Files stay on your device.” · no competitor/brand logos · no screenshot clutter.

**Do not:** camera logos, wing/skydive marks, “Fly*” anything.

---

## 8. Handoff checklist for Cursor

### Files to create first (Phase A)

- [ ] `tokens.css` (or `:root` block) — all variables above + dark theme + safe-area helpers  
- [ ] Shared layout: `header-slim.php` (logo + menu only) · `head.php` (meta, OG) · document footer for non-map pages  
- [ ] `map-tiles.js` (or PHP→JS config) — **single** tile module  
- [ ] `ads.php` partial + `config/ads.php` (`enabled: false`; map-tool slots default off)  
- [ ] `components/privacy-badge.php`  
- [ ] `components/file-drop.js` + CSS (whole-map overlay, centered empty card, progress, errors, multi)  
- [ ] `components/tool-card.php` (home grid)  
- [ ] `components/map-shell.js` — full-viewport map + chip slots + resize on dock change  
- [ ] `components/float-chip.js` / `map-popover.js` — stats, tools, export (collapsible)  
- [ ] `components/graph-dock.js` — under-map dock, drag handle, tabs/stack, min/max, `gpstoolset.ui.v1`  
- [ ] `components/ui-state.js` — read/write `localStorage` schema `gpstoolset.ui.v1`  
- [ ] `components/units-toggle.js` (via ui-state)  
- [ ] Logo SVG (mark A) + favicon set + OG template  

### Components list (reuse everywhere)

| Component | Notes |
|-----------|--------|
| `AppHeaderSlim` | Logo + ☰ only; ~48px mobile / 56px desktop; safe-area-top |
| `PrivacyBadge` | Lock + fixed sentence (home/guides; menu + empty on map tools) |
| `FileDrop` | Whole-map overlay + centered empty card + sample + progress + errors |
| `ToolCard` | Icon, title, 1-line benefit, href (home) |
| `MapShell` | Full-viewport Leaflet host; chip anchors; `invalidateSize` on dock resize |
| `FloatChip` / `MapPopover` | Stats, tools, export — collapsible; never cover track by default |
| `StatsList` | Key/value inside stats popover; mono numbers |
| `GraphDock` | Under-map; drag handle; tabs/stack; min/max heights |
| `ChartTrack` | Speed/altitude/etc.; hover syncs scrub marker on map |
| `UiState` | `gpstoolset.ui.v1` load/save (graphs, dock, chips, units) |
| `UnitsToggle` | km↔mi via UiState |
| `ExportBar` | Inside export popover |
| `AdSlot` | By id; no-op when disabled; **not** mounted on map tools at launch |
| `GuideCard` | Title, blurb, href |
| `EmptyState` | Centered over map; short copy + CTA |
| `ErrorCallout` | Danger tone on empty card |

**Removed / do not build:** `SidePanel`, permanent `BottomSheet` for tool chrome.

### Do / don’t

| Do | Don’t |
|----|-------|
| Full-screen map + slim top bar | Permanent 360px side panel or tool bottom sheet |
| Graphs dock under map (map shrinks) | Overlay charts on the track |
| Persist dock/graph UI in `gpstoolset.ui.v1` | Lose open/height on refresh |
| Client-side parse only; say so in UI | Upload to server “for convenience” |
| One tile config, one ads config | Hardcode tile URLs or ad markup per page |
| 44px taps; visible focus (tint + underline); safe-area insets | Pulse/blink targets; autoplaying motion |
| GoPro/DJI as compatibility words | Brand names in logo, URLs, or “Telemetry Extractor” |
| “GNSS logger CSV exports” | Any mention of FlySight |
| No ads on map tools at launch | Ads over map, drop overlay, or sticky on controls |

### Acceptance smoke (first tool pages)

1. Home drop of `.gpx` → `/gpx-viewer` full-screen map with track fitted (slim bar only).  
2. Privacy line in menu/empty; no network upload of file (DevTools).  
3. Toggle Speed graph → dock appears under map, map shrinks; drag handle resizes; refresh restores `gpstoolset.ui.v1`.  
4. Chart hover moves scrub marker on track.  
5. Mobile: 48px bar, thumb-reachable chips, dock ≤40vh, safe-area respected; **no** ads on map page.  
6. Dark theme + large text don’t break map or dock.  
7. Keyboard: open file, tab chips/export, arrow-resize dock handle, visible focus.


---

*Design & UX · GPS Toolset · 2026-11-01 Europe/Tallinn · updated: full-screen map (Paul) · for GPS Toolset Manager + Cursor handoff*
