<script>
    import {createEventDispatcher} from 'svelte';

    import 'ol/ol.css';
    import {Map, View} from 'ol';
    import TileLayer from 'ol/layer/Tile';
    import OSM from 'ol/source/OSM';

    const dispatcher = createEventDispatcher();

    export let initialCenter;
    export let initialZoom;

    let mapId = 'mapDiv';
    let map;

    export let mapLayers = {
        "base": new OSM(),
        "overlay": new TileLayer()
    }

    let view = new View({ center: initialCenter, zoom: initialZoom });
    console.log(view);

    export const changeCenterZoom = (center,zoom) => {
        map.getView().setCenter(center);
        map.getView().setZoom(zoom);
    }

    function initializeMap(node, _id) {
        let w = setInterval(()=> {
            if(node.clientHeight > 0){
                clearTimeout(w);
                map = new Map({
                target: _id,
                controls: [],
                view: view
                });

                for (const [k,v] of Object.entries(mapLayers)) {
                    v.setMap(map);
                }

                map.on('moveend', (e) => { dispatcher('changedExtent',{'extent': map.getView().calculateExtent() }); } );

            } else { console.log("waiting for sized box"); }
        }, 100
        );

    }


</script>

<style>
    div {
        width: 100%;
        height: 100%;
        margin: 0;
    }
</style>

<div id={mapId} use:initializeMap={mapId}></div>