// Research connectors for the "Research" tab. Two kinds:
//
//   searchConnectors — items in the "Search this location for …" dropdown.
//     Each builds an outbound URL to an external web app from the current map
//     view. `queryType` selects what geometry `urlFunction` receives:
//       "bbox"        → [west, south, east, north]  (EPSG:4326)
//       "centerpoint" → [lon, lat]                  (EPSG:4326)
//
//   dataConnectors — items in the "Load data from …" dropdown. Each fetches
//     POINT data from an API and renders it as a clickable scratch layer.
//       queryUrl(bbox) → request URL; MUST return GeoJSON (e.g. ArcGIS f=geojson).
//       label(props)   → text label drawn on each point (props = a GeoJSON
//                        feature's `properties` object).
//       targetUrl(props) → URL the point's popup links to.
//     Only Point geometries in the response are rendered.
//
// This file is part of the fork-and-edit config surface (see FORKING.md §2):
// replace the entries below with your region's equivalents, or export empty
// arrays to hide that dropdown. When BOTH arrays are empty and annotations are
// disabled, the Research tab is hidden entirely.

export const searchConnectors = [

    {
        name: "More maps in Allmaps Explore (beta)",
        queryType: "centerpoint",
        hiddenOnMobile: true,
        urlFunction: (geo) => `https://dev.explore.allmaps.org/#12/${geo[1]}/${geo[0]}`,
    }
];

export const dataConnectors = [
    
];
