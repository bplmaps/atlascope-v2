<script>
    import { createEventDispatcher, onMount } from "svelte";

    import MapControls from "./MapControls.svelte";

    import "ol/ol.css";
    import { Map, View } from "ol";
    import TileLayer from "ol/layer/Tile";
    import OSM from "ol/source/OSM";

    const dispatcher = createEventDispatcher();

    export let initialCenter;
    export let initialZoom;

    let map;

    let view = new View({ center: initialCenter, zoom: initialZoom });

    export const changeCenterZoom = (center, zoom) => {
        map.getView().setCenter(center);
        map.getView().setZoom(zoom);
    };

    function mapMoved() {
        const extent = map.getView().calculateExtent(map.getSize());
        dispatcher('changedExtent', {'extent': extent});
    }

    onMount(() => {
        map = new Map({
            target: "map-div",
            controls: [],
            view: view,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
        });

        map.on('moveend', mapMoved);
    });


</script>

<section id="map" class="ui-top-level-layer">
    <div id="map-div" />

    <MapControls />
</section>

<style>
    section {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        margin: 0;
        padding: 0;
    }

    #map-div {
        width: 100%;
        height: 100%;
        margin: 0;
    }
</style>
