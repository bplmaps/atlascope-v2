import { writable } from 'svelte/store'

export const allLayers = writable([]);
export const appState = writable({
    layersLoaded: false,
    modals: {
        splash: true,
        search: false
    }
});