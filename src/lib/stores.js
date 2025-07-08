import { writable } from 'svelte/store'

export const allLayers = writable([]);
export const appState = writable({
    gateway: true,
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