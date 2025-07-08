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
    annotationMode: false,
    annotationEntry: false,
    layerChangePopup: false,
    center: null,
    zoom: null,
    extent: null,
})

export const allLayers = $state({
    layers: []
})