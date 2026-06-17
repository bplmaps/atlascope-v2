import XYZ from "ol/source/XYZ";
import TileJSON from "ol/source/TileJSON";

import { mapState, allLayers } from "../state.svelte.js";

export const getLayerDataById = (layerId) => {
  return allLayers.layers.find((d) => d.properties.identifier === layerId);
};

// Returns a changeLayer(layer, id, force) function bound to the component's
// pair of OpenLayers TileLayers ({ base, overlay })
export function createLayerSwitcher(olLayers) {
  return function changeLayer(layer, id, force = false) {
    if (force || id != mapState.layers[layer].id) {
      let newLayer = getLayerDataById(id);
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
      mapState.layers[layer].id = newLayer.properties.identifier;
    }
  };
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
