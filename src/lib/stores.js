import { writable } from 'svelte/store'

export const allLayers = writable([]);
export const appState = writable({
    gateway: true,
    layersLoaded: false,
    modals: {
        splash: true,
        search: false,
        biblio: false,
        geolocation: false
    }
});