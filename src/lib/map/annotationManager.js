import Draw, { createBox } from "ol/interaction/Draw";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Feature from "ol/Feature";
import { fromExtent } from "ol/geom/Polygon";
import { Stroke, Style } from "ol/style";

import { mapState } from "../state.svelte.js";
import {
  getAnnotationsWithinExtent,
  getSingleAnnotation,
} from "../helpers/supabaseFunctions";

// Owns the OpenLayers sources, layers, and Draw interaction for the
// annotation feature. Created once per Map component; `getMap`/`getView`
// are closures because the OL map doesn't exist until Map.svelte mounts.
// `onDrawEnd(extent, pixel)` reports a finished box back to the component,
// which owns the entry-form UI state.
export function createAnnotationManager({ getMap, getView, changeLayer, onDrawEnd }) {
  let drawer;
  const drawerSource = new VectorSource({ wrapX: false });
  const drawerLayer = new VectorLayer({ source: drawerSource });

  const loadedSource = new VectorSource({ wrapX: false });
  const loadedLayer = new VectorLayer({
    source: loadedSource,
    style: new Style({
      stroke: new Stroke({
        color: "rgba(255, 255, 255, 0.9)",
        width: 5,
      }),
    }),
  });

  function enableEntryMode() {
    const map = getMap();
    mapState.annotationEntry = true;
    map.addLayer(drawerLayer);
    drawer = new Draw({
      source: drawerSource,
      type: "Circle",
      geometryFunction: createBox(),
    });

    drawer.on("drawend", (e) => {
      onDrawEnd(e.feature.getGeometry().getExtent(), [
        e.target.downPx_[0],
        e.target.downPx_[1],
      ]);
      mapState.annotationSave = true;
      map.removeInteraction(drawer);
    });
    map.addInteraction(drawer);
  }

  function disableEntryMode() {
    const map = getMap();
    map.removeInteraction(drawer);
    mapState.annotationEntry = false;
    drawerSource.clear();
    map.removeLayer(drawerLayer);
  }

  function cancelEntry() {
    getMap().addInteraction(drawer);
    mapState.annotationEntry = false;
    drawerSource.clear();
  }

  // Fetches annotations within the current view extent, invoking
  // `onAnnotation` for each one as it arrives. If the extent contains no
  // annotations, `onEmpty` is called instead.
  function loadWithinCurrentExtent(onAnnotation, onEmpty) {
    getAnnotationsWithinExtent(getView().calculateExtent()).then((d) => {
      if (d.length === 0) {
        onEmpty?.();
        return;
      }
      d.forEach((x) => {
        getSingleAnnotation(x.id).then(onAnnotation);
      });
    });
  }

  function clearLoaded() {
    loadedSource.clear();
  }

  // Highlights an annotation's extent, switches the overlay to its source
  // layer, and fits the view to it
  function showAnnotation(annotation) {
    const extentJson = JSON.parse(annotation.extent);
    loadedSource.clear();
    loadedSource.addFeature(new Feature(fromExtent(extentJson)));

    changeLayer("overlay", annotation.layer);

    getView().fit(extentJson, {
      padding: [100, 100, 300, 100],
      duration: 1000,
      maxZoom: 19,
    });
  }

  return {
    loadedLayer,
    enableEntryMode,
    disableEntryMode,
    cancelEntry,
    loadWithinCurrentExtent,
    clearLoaded,
    showAnnotation,
  };
}
