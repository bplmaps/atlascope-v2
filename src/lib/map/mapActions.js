import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import { mapState } from "../state.svelte.js";
import { loadAllmapsLayer } from "./layerSwitching.js";

// Non-reactive references to the live OpenLayers objects, registered by
// Map.svelte on mount. A request made before the map exists is held
// (latest wins) and flushed on registration, so early callers such as
// URL-param handling don't lose their request.
let registered = null;
let pending = null;

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
