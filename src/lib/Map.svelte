<script>
    import { createEventDispatcher, onMount } from "svelte";

    import MapControls from "./MapControls.svelte";

    import "ol/ol.css";
    import { Map, View } from "ol";
    import TileLayer from "ol/layer/Tile";
    import XYZ from "ol/source/XYZ";
    import TileJSON from "ol/source/TileJSON";

    import { intersector } from "./helpers/intersector";

    const dispatcher = createEventDispatcher();

    import { allLayers } from "./stores.js";

    export let defaultStartLocation;

    let map;

    let view = new View({
        center: defaultStartLocation.center,
        zoom: defaultStartLocation.zoom,
    });

    export const changeCenterZoom = (center, zoom) => {
        map.getView().setCenter(center);
        map.getView().setZoom(zoom);
    };

    export const changeLayer = (layer, id) => {
        if(layer === "overlay") {
            // let newLayer = $allLayers.find(l=>l.properties.id === id);
            layers.overlay.id = id;
            console.log(id);
            layers.overlay.olLayer.setSource(new TileJSON({url: `https://s3.us-east-2.wasabisys.com/urbanatlases/${id}/tileset.json`, crossOrigin: 'anonymous'}))
        }
    };

    // This function updates the `allLayers` store every time the map is moved, to figure out how many layers are available in the new viewport
    // It does it by running the `intersector` function on each layer's geometry relative to the viewport extent
    // and then sets the `extentVisible` property on that layer in the store
    function mapMoved() {
        const extent = map.getView().calculateExtent(map.getSize());
        allLayers.update((a) => {
            return a.map((layer) => {
                let l = layer;
                l.extentVisible = intersector(l.geometry, extent);
                return l;
            });
        });

        if( $allLayers.find(l=>l.properties.id===layers.overlay.id).extentVisible < 0.3 ) {
            let bestNewLayer = $allLayers.sort((a,b)=>{return b.extentVisible - a.extentVisible})[0].properties.id;
            changeLayer('overlay',bestNewLayer);
        }
    }

    let layers = {
        base: {
            id: "",
            olLayer: new TileLayer({
                source: new XYZ({
                    url: "https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=1HCKO0pQuPEfNXXzGgSM",
                    crossOrigin: "anonmyous",
                }),
            }),
        },
        overlay: {
            id: "39999059011526",
            olLayer: new TileLayer({
                source: new TileJSON({
                    url: "https://s3.us-east-2.wasabisys.com/urbanatlases/39999059011526/tileset.json",
                }),
            }),
        },
    };

    // This is the function that executes the rendering of the spyglass, swipe, or opacity feature for the overlay layer
    // It's bound to the `prerender` event on `overlayLayer`
    layers.overlay.olLayer.on("prerender", function (event) {
        const ctx = event.context;

        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";

        ctx.arc(
            ctx.canvas.width / 2,
            ctx.canvas.height / 2,
            Math.abs(120),
            0,
            2 * Math.PI
        );

        ctx.fillStyle = "rgba(10,10,10,0.85)";
        ctx.fill();

        ctx.stroke();
        ctx.clip();
    });

    // after rendering the layer, restore the canvas context
    layers.overlay.olLayer.on("postrender", function (event) {
        var ctx = event.context;
        ctx.restore();
    });

    // We wait to initialize the main `map` object until the Svelte module has mounted, otherwise we won't have a sized element in the DOM onto which to bind it
    onMount(() => {
        map = new Map({
            target: "map-div",
            controls: [],
            view: view,
            layers: [layers.base.olLayer, layers.overlay.olLayer],
        });

        map.on("moveend", mapMoved);
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
