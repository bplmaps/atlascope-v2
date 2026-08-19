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
        name: "More maps in the Leventhal collections",
        queryType: "bbox",
        hiddenOnMobile: false,
        urlFunction: (geo) => `https://www.digitalcommonwealth.org/search?coordinates=%5B${geo[1]}%2C${geo[0]}%20TO%20${geo[3]}%2C${geo[2]}%5D&spatial_search_type=bbox&view=gallery&f%5Bgenre_basic_ssim%5D%5B%5D=Maps&spatial_search_type=bbox&view=gallery`,
    },
    {
        name: "More maps in Allmaps Explore (beta)",
        queryType: "centerpoint",
        hiddenOnMobile: true,
        urlFunction: (geo) => `https://dev.explore.allmaps.org/#12/${geo[1]}/${geo[0]}`,
    },
    {
        name: "Photographs in Digital Commonwealth",
        queryType: "bbox",
        hiddenOnMobile: false,
        urlFunction: (geo) => `https://www.digitalcommonwealth.org/search?coordinates=%5B${geo[1]}%2C${geo[0]}%20TO%20${geo[3]}%2C${geo[2]}%5D&spatial_search_type=bbox&view=gallery&f%5Bgenre_basic_ssim%5D%5B%5D=Photographs`,
    },
    {
        name: "Tax parcels in MassMapper",
        queryType: "bbox",
        hiddenOnMobile: true,
        urlFunction: (geo) => `https://maps.massgis.digital.mass.gov/MassMapper/MassMapper.html?bl=MassGIS%20Basemap__100&l=Basemaps_L3Parcels____ON__100&b=${geo.join(",")}`,
    }
];

export const dataConnectors = [
    {
        name: "MACRIS historic inventory",
        hiddenOnMobile: false,
        queryUrl: (bbox) =>
            `https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/MHC_Inventory_GDB/FeatureServer/0/query` +
            `?where=1%3D1&outFields=*&geometry=${bbox.join(",")}&geometryType=esriGeometryEnvelope` +
            `&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`,
        // MACRIS returns whitespace-only strings (e.g. " ") for empty fields,
        // which are truthy — so a plain `a || b` chain stops at the first blank
        // field. Trim each candidate and take the first that has real content.
        label: (props) =>
            [props.HISTORIC_N, props.COMMON_NAM, props.ADDRESS, props.MHCN]
                .map((v) => (typeof v === "string" ? v.trim() : ""))
                .find((v) => v) || "Unnamed resource",
        targetUrl: (props) => `https://mhc-macris.net/details?mhcid=${props.MHCN}`,
    },
];
