export const appState = $state({
    layersLoaded: false,
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
})

export const allLayers = $state({
    layers: []
})