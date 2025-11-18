export const appState = $state({
    layersLoaded: false,
    referenceLayersLoaded: false,
    modals: {
        splash: true,
        search: false,
        biblio: false,
        geolocation: false,
        tourList: false,
        about: false
    },
    tour: {
        active: false,
        id: null
    }
});

export const mapState = $state({
    mounted: false,
    layers: {
      base: {
        id: null
      },
      overlay: {
        id: null
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
    lockLayers: false,
    requestedMapState: {
      requested: false,
      dropPin: false,
      animate: 0,
      viewMode: null,
      center: null,
      zoom: null,
      extent: null,
      rotation: null,
      base: null,
      overlay: null
    }
})

export const allLayers = $state({
    layers: []
})

export const referenceLayers = $state({
    layers: []
})