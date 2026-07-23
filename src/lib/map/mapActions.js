import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import GeoJSON from "ol/format/GeoJSON";

import { mapState } from "../state.svelte.js";
import { loadAllmapsLayer } from "./layerSwitching.js";

// Non-reactive references to the live OpenLayers objects, registered by
// Map.svelte on mount. A request made before the map exists is held
// (latest wins) and flushed on registration, so early callers such as
// URL-param handling don't lose their request.
let registered = null;
let pending = null;

// The dataConnector definition currently rendered on the scratch layer. Kept
// in module scope (not reactive state) because it carries functions; the UI
// only needs its name, which lives in mapState.activeDataConnectorName.
let activeConnector = null;

export function registerMap(instances) {
  registered = instances;
  if (pending) {
    const request = pending;
    pending = null;
    applyMapState(request);
  }
}

export function unregisterMap() {
  registered = null;
}

// Loads a parsed Allmaps annotation onto a slot ("base"/"overlay"). The modal
// calls this rather than touching the live map directly. Throws if the map
// isn't registered yet or the annotation has no usable maps.
export async function loadAllmapsAnnotation(slot, annotation, url) {
  if (!registered) {
    throw new Error("map not ready");
  }
  const { warpedLayers, olLayers } = registered;
  await loadAllmapsLayer(warpedLayers, olLayers, slot, annotation, url);
}

// Imperatively applies a requested map state: drops a pin, switches
// layers, changes view mode, and animates the view. Replaces the old
// mapState.requestedMapState flag-queue, which silently dropped any
// request made while another was pending.
export function applyMapState({
  center = null,
  zoom = null,
  rotation = null,
  viewMode = null,
  base = null,
  overlay = null,
  dropPin = false,
  animate = 0,
} = {}) {
  if (!registered) {
    pending = { center, zoom, rotation, viewMode, base, overlay, dropPin, animate };
    return;
  }

  const { map, view, markerSource, changeLayer } = registered;

  if (dropPin && center) {
    markerSource.clear();
    markerSource.addFeature(
      new Feature({ geometry: new Point(fromLonLat(center)) }),
    );
  }

  if (overlay) {
    changeLayer("overlay", overlay);
  }

  if (base) {
    changeLayer("base", base);
  }

  if (viewMode) {
    mapState.viewMode = viewMode;
    map.render();
  }

  view.animate({
    center: center ? fromLonLat(center) : view.getCenter(),
    zoom: zoom ? zoom : view.getZoom(),
    rotation: rotation !== null ? rotation : view.getRotation(),
    duration: animate,
  });
}

// Fetches a dataConnector's GeoJSON for the given bbox ([w,s,e,n] EPSG:4326)
// and renders its Point features on the scratch layer, replacing whatever was
// there before. Each feature carries a `_label` (drawn on the map) and a
// `_targetUrl` (opened from the click popup). Returns the number of points
// rendered so the caller can report "0 results". Records the connector as the
// active one so the view-change reload prompt knows what to re-run.
export async function loadScratchData(connector, bbox) {
  if (!registered || !bbox) {
    return 0;
  }
  const { scratchSource } = registered;

  // Surface the badge (with its spinner) immediately, before the request
  // returns, and disable its buttons until it does.
  activeConnector = connector;
  mapState.activeDataConnectorName = connector.name;
  mapState.scratchLoading = true;
  mapState.scratchReloadAvailable = false;

  try {
    const res = await fetch(connector.queryUrl(bbox));
    const json = await res.json();
    const features = new GeoJSON()
      .readFeatures(json, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      })
      .filter((f) => f.getGeometry()?.getType() === "Point");

    features.forEach((f) => {
      const props = f.getProperties();
      // Guard against null/undefined AND whitespace-only labels.
      const rawLabel = connector.label(props);
      const label = (typeof rawLabel === "string" ? rawLabel : "").trim();
      f.set("_label", label || "Unnamed resource");
      f.set("_targetUrl", connector.targetUrl(props));
    });

    scratchSource.clear();
    scratchSource.addFeatures(features);
    mapState.scratchPointCount = features.length;

    return features.length;
  } finally {
    mapState.scratchLoading = false;
  }
}

// Re-runs the active dataConnector at a new bbox (invoked by the reload
// prompt). No-op when nothing is loaded.
export async function reloadScratchData(bbox) {
  if (!activeConnector) {
    return 0;
  }
  return loadScratchData(activeConnector, bbox);
}

// Removes all loaded scratch data and dismisses any pending reload prompt.
export function clearScratchData() {
  registered?.scratchSource.clear();
  activeConnector = null;
  mapState.activeDataConnectorName = null;
  mapState.scratchLoading = false;
  mapState.scratchPointCount = 0;
  mapState.scratchReloadAvailable = false;
}
