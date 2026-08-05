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

Research-tab connectors, exported as **two** arrays.

`searchConnectors` — items in the "Search this location for …" dropdown. Each
opens an external web app for the current map view. Fields:

- `name` — dropdown label.
- `queryType` — `"bbox"` or `"centerpoint"`.
- `hiddenOnMobile` — boolean.
- `urlFunction(geo)` — returns the URL to open. `geo` is
  `[west, south, east, north]` (EPSG:4326) when `queryType` is `"bbox"`, or
  `[lon, lat]` (EPSG:4326) when `queryType` is `"centerpoint"`.

`dataConnectors` — items in the "Load data from …" dropdown. Each fetches
POINT data from an API and renders it as a clickable scratch layer on the map.
Fields:

- `name` — dropdown label.
- `hiddenOnMobile` — boolean.
- `queryUrl(bbox)` — request URL, where `bbox` is `[west, south, east, north]`
  (EPSG:4326). The request MUST return GeoJSON (e.g. an ArcGIS FeatureServer
  query with `f=geojson`). Only Point geometries in the response are rendered.
- `label(props)` — returns the text label drawn on each point.
- `targetUrl(props)` — returns the URL the point's popup links to.

For both `label` and `targetUrl`, `props` is a GeoJSON feature's `properties`
object.

Replace the Boston/Massachusetts entries (Digital Commonwealth, MassMapper,
MACRIS) with your region's equivalents, or export an empty array to hide that
dropdown. The Research tab is hidden only when **both** `searchConnectors` and
`dataConnectors` are empty **and** annotations are disabled.

## 3. Environment variables (`.env`)

Required only when `features.tours` or `features.annotations` is enabled:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The Supabase project needs a `tours` table (`id`, `published`,
`metadataJson`, `stopsJson`) and an `annotations` table (`id`, `timestamp`,
`body`, `extent`, `layer`, `cX`, `cY`, `max_x`, `max_y`, `min_x`, `min_y`,
`email`). With both features off, no Supabase client is ever created and the
supabase-js chunk is never fetched.

### Map image sharing (`ExportShareButton`)

`src/lib/mapControls/ExportShareButton.svelte` composites the map to a PNG,
writes it to an S3-compatible bucket, and opens an outbound URL built from the
stored object's random hash. Two props:

- `urlTemplate` — the URL to open, with `{hash}` standing in for the stored
  filename. Pass it as a JS string — `urlTemplate={"https://example.org/view/{hash}"}`
  — not as a bare attribute, since Svelte reads `{hash}` in attribute position
  as an interpolation.
- `label` — the button text.

Optional: `icon` (defaults to a camera), `busyLabel`, `collapsibleLabel`,
`hideableOnMobile`. Because the template is a prop rather than instance config,
the same button can be dropped in more than once pointing at different
services. `MapControls.svelte` has a working example in the Controls tab.

The upload is signed by `netlify/functions/sign-image-upload.js`, so these are
**server-side** variables (set in the Netlify UI, not `VITE_`-prefixed — they
must never reach the browser bundle):

- `WASABI_ACCESS_KEY_ID`
- `WASABI_SECRET_ACCESS_KEY`
- `WASABI_REGION` — e.g. `us-east-2`
- `WASABI_BUCKET`
- `WASABI_PREFIX` — directory the images are written under
- `ALLOWED_ORIGINS` — optional comma-separated origin allowlist, e.g.
  `https://atlascope.org,http://localhost:8888`

Unset any of the first five and the button fails with a message rather than
half-working. Shift+Alt+E, which downloads the same composited PNG instead of
uploading it, is unaffected and needs no configuration.

The endpoint is unauthenticated, so the credential should be scoped to
`s3:PutObject` on `<bucket>/<prefix>/*` only — no `ListBucket`, no
`DeleteObject`, no access outside the prefix. `ALLOWED_ORIGINS` is a speed bump,
not security. The function, not the browser, picks the object key, so callers
can't overwrite existing objects.

The bucket also needs a CORS rule, or the browser's PUT dies at the preflight:

```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://atlascope.org</AllowedOrigin>
    <AllowedOrigin>http://localhost:8888</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedHeader>Content-Type</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

Local development needs `npx netlify dev` (port 8888) rather than `npm run dev`,
since `vite` alone doesn't serve the function.

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
