# Forking Atlascope for another city

Atlascope's Boston-specific configuration is isolated so the app can be
redeployed for another city by editing configuration and assets — no source
changes required. This document enumerates the complete fork surface.

## 1. `src/config/instance.json`

Every instance-specific value lives here.

| Field | What it controls |
|---|---|
| `baseURL` | Absolute URL of the deployed instance (used in share/tour links) |
| `name` | City name, shown in titles ("Atlascope {name}") |
| `tagline` | Sentence fragment after the app name on the splash screen |
| `geographicCoverage` | Phrase describing the covered region on the splash screen |
| `institutionalShortName` | Institution name in the page title |
| `institutionalCredit` | Markdown credit line on the splash screen |
| `maxExtent` | `[w, s, e, n]` lon/lat bounding box of the instance's coverage |
| `defaultStartLocation` | `name` (button label), `center`, `zoom`, `overlayLayerId`, `baseLayerId` for the "Start at …" button |
| `features.annotations` | Enables the user-annotation feature (Supabase-backed). Absent = off. |
| `features.tours` | Enables guided tours (Supabase-backed). Absent = off. |
| `contactEmail` | "Get in touch" mailto in the tour list; block hidden when unset |
| `map.minZoom` | Minimum map zoom |
| `map.fallbackBaseLayerId` | Base layer swapped in when the current base falls below 40% viewport coverage |
| `map.tileSize512LayerIds` | TileJSON layer identifiers that serve 512px tiles |
| `geocoder.bbox` | `[w, s, e, n]` bbox constraining MapTiler geocoding queries |
| `geocoder.country` | ISO country code for geocoding; omit to search without a country filter |
| `coverageDescriptiveList` | URL of a JSON array of named places (`name`, `center`, optional `new`, `neighborhood`) for the splash combobox; omit to hide the combobox |
| `volumeExtentsFile` | URL of the layer-extents TopoJSON (see §4) |
| `footprintsDissolved` | URL of a dissolved-coverage GeoJSON used to filter geocoder results |
| `geocodeKey` | MapTiler API key |
| `aboutPage` | External "About & Credits" URL |
| `outOfBoundsMessage` | `{url, text}` banner link when no layers cover the viewport |
| `splashPageNoteMessage` | `{url, text}` note link at the bottom of the splash; optional |
| `gaMeasurementId` | Google Analytics 4 id; omit to disable analytics entirely |
| `metaTags` | SEO/social tags injected into `index.html` at build time (see `instanceMetaTags` in `vite.config.js`): `title`, `description`, `canonical`, `openGraph` (incl. `images[0]`), `twitter` |

## 2. `src/config/research-connections.js`

External bbox-driven search links shown in the Research tab. Each entry has a
`name`, a `searchFunction(bbox)` returning a URL, and `hiddenOnMobile`.
Replace the Boston/Massachusetts entries (Digital Commonwealth, MassMapper)
with your region's equivalents, or export an empty array. When the array is
empty **and** annotations are disabled, the Research tab is hidden.

## 3. Environment variables (`.env`)

Required only when `features.tours` or `features.annotations` is enabled:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The Supabase project needs a `tours` table (`id`, `published`,
`metadataJson`, `stopsJson`) and an `annotations` table (`id`, `timestamp`,
`body`, `extent`, `layer`, `cX`, `cY`, `max_x`, `max_y`, `min_x`, `min_y`,
`email`). With both features off, no Supabase client is ever created and the
supabase-js chunk is never fetched.

## 4. Hosted data files

The three URLs in `instance.json` point at data you host (S3 or similar):

- **`volumeExtentsFile`** — a TopoJSON with a single object (its name doesn't
  matter; the app reads the first object) whose features are the atlas
  layers. Each feature needs `properties.identifier` (unique layer id, used
  in URLs), `properties.year`, `properties.source` (`{type: "xyz"|"tilejson",
  url}`), and a footprint geometry (or `geometry: null` plus
  `properties.globalExtent: true` for reference basemaps like the fallback
  base layer).
- **`coverageDescriptiveList`** — JSON array for the splash search combobox.
- **`footprintsDissolved`** — GeoJSON `GeometryCollection` whose first
  geometry is the dissolved coverage polygon (gates geocoder results).

## 5. Static assets

- `public/favicon.png` — replace with your instance's favicon.
- The logo is generic (`src/lib/ui/AtlascopeLogo.svelte` renders the
  Atlascope wordmark).
