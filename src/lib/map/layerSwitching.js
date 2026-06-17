import XYZ from "ol/source/XYZ";
import TileJSON from "ol/source/TileJSON";

import { mapState, allLayers } from "../state.svelte.js";

export const getLayerDataById = (layerId) => {
  return allLayers.layers.find((d) => d.properties.identifier === layerId);
};

// True when a slot is currently showing a custom Allmaps WarpedMapLayer
// rather than a tile layer from the curated list.
export const isCustomLayer = (slot) => mapState.layers[slot].type === "allmaps";

// Returns a changeLayer(layer, id, force) function bound to the component's
// pair of OpenLayers TileLayers ({ base, overlay }) and, optionally, the
// paired WarpedMapLayers used for custom Allmaps annotations.
export function createLayerSwitcher(olLayers, warpedLayers) {
  return function changeLayer(layer, id, force = false) {
    if (force || id != mapState.layers[layer].id) {
      let newLayer = getLayerDataById(id);
      // Defensive: custom Allmaps ids are loaded via loadAllmapsLayer and
      // never reach here, but guard against an unknown id all the same.
      if (!newLayer) return;

      // Restore the tile layer and tear down any custom Allmaps layer in
      // this slot.
      olLayers[layer].setVisible(true);
      if (warpedLayers && warpedLayers[layer]) {
        warpedLayers[layer].setVisible(false);
        warpedLayers[layer].clear();
      }

      if (newLayer.properties.source.type === "tilejson") {
        olLayers[layer].setSource(
          new TileJSON({
            url: newLayer.properties.source.url,
            crossOrigin: "anonymous",
            tileSize:
              newLayer.properties.identifier === "maptiler-streets" ? 512 : 256, // klugey hack for maptiler-streets, which is 512px tiles
          }),
        );
      } else if (newLayer.properties.source.type === "xyz") {
        olLayers[layer].setSource(
          new XYZ({
            url: newLayer.properties.source.url,
            crossOrigin: "anonymous",
          }),
        );
      }
      mapState.layers[layer] = {
        id: newLayer.properties.identifier,
        type: "tile",
        annotationUrl: null,
      };
    }
  };
}

// Loads a parsed Allmaps Georeference Annotation onto a slot's WarpedMapLayer,
// hiding the slot's tile layer. Throws if the annotation yields no usable
// maps so callers (the modal) can surface an error. Forces lockLayers on so
// the custom layer isn't auto-switched away on map move.
export async function loadAllmapsLayer(
  warpedLayers,
  olLayers,
  slot,
  annotation,
  url,
) {
  warpedLayers[slot].clear();
  const results = await warpedLayers[slot].addGeoreferenceAnnotation(annotation);
  if (!results.some((r) => typeof r === "string")) {
    throw new Error("no valid maps in annotation");
  }
  warpedLayers[slot].setVisible(true);
  olLayers[slot].setVisible(false);
  mapState.layers[slot] = {
    id: "allmaps-custom",
    type: "allmaps",
    annotationUrl: url,
  };
  mapState.lockLayers = true;
}

// Auto-switch heuristic for the overlay layer: if the current overlay is
// less than 40% visible AND another layer is more than 20% better, return
// that layer's identifier; otherwise null.
export function pickBestOverlayLayer(visibility) {
  if (mapState.lockLayers) return null;

  const overlayVisible = visibility[mapState.layers.overlay.id];
  if (!(overlayVisible < 0.4)) return null;

  const betterExists = allLayers.layers.some(
    (d) => visibility[d.properties.identifier] > overlayVisible + 0.2,
  );
  if (!betterExists) return null;

  const bestNewLayer = allLayers.layers
    .filter((d) => d.geometry !== null)
    .sort((a, b) => {
      return (
        visibility[b.properties.identifier] -
        visibility[a.properties.identifier]
      );
    })[0].properties.identifier;

  return bestNewLayer != mapState.layers.overlay.id ? bestNewLayer : null;
}
