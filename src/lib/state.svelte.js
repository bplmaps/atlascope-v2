export const appState = $state({
    layersLoaded: false,
    modals: {
        splash: true,
        search: false,
        biblio: false,
        geolocation: false,
        tourList: false,
        about: false,
        allmaps: false
    },
    allmapsTargetSlot: null,
    tour: {
        active: false,
        id: null
    }
});

export const mapState = $state({
    mounted: false,
    layers: {
      base: {
        id: null,
        type: "tile",
        annotationUrl: null
      },
      overlay: {
        id: null,
        type: "tile",
        annotationUrl: null
      },
    },
    viewMode: "glass",
    annotationRead: false,
    annotationEntry: false,
    annotationSave: false,
    layerChangePopup: false,
    center: null,
    zoom: null,
    extent: null,
    rotation: null,
    lockLayers: false
})

// Layer metadata is a large array of TopoJSON features (geometries included),
// so it's deliberately $state.raw: treated as immutable after load, replaced
// wholesale, and never deep-proxied. Per-layer viewport coverage lives in the
// small flat `visibility` record instead, keyed by properties.identifier and
// rewritten once per (debounced) map move.
class LayerStore {
    layers = $state.raw([]);
    visibility = $state({});
}

export const allLayers = new LayerStore();