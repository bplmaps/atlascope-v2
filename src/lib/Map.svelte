<script>
    import { createEventDispatcher, onMount } from "svelte";
    import Fa from "svelte-fa";
    import { faHand } from "@fortawesome/free-solid-svg-icons";

    import MapControls from "./MapControls.svelte";

    import "ol/ol.css";
    import { Map, View } from "ol";
    import TileLayer from "ol/layer/Tile";
    import XYZ from "ol/source/XYZ";
    import TileJSON from "ol/source/TileJSON";
    import { fromLonLat } from "ol/proj";

    import { intersector } from "./helpers/intersector";

    const dispatcher = createEventDispatcher();

    import { allLayers } from "./stores.js";
    import instanceVariables from "../config/instance.json";


    let map;
    let mapState = {
        layers: {
            base: {
                id: "",
                title: "",
                olLayer: new TileLayer(),
            },
            overlay: {
                id: "",
                title: "",
                olLayer: new TileLayer(),
            },
        },
        viewMode: "glass",
    };

    let view = new View({
        center: instanceVariables.defaultStartLocation.center,
        zoom: instanceVariables.defaultStartLocation.zoom,
    });

    export const changeCenterZoom = (center, zoom) => {
        map.getView().setCenter(center);
        map.getView().setZoom(zoom);
    };

    // function for changing the layer, we export it so that the outer app can also access this function
    export const changeLayer = (layer, id) => {
        let newLayer;
        let possibleHistoricLayer = $allLayers.find(
            (l) => l.properties.id === id
        );
        if (possibleHistoricLayer) {
            newLayer = possibleHistoricLayer;
        } else {
            newLayer = instanceVariables.referenceLayers.find(
                (l) => l.properties.id === id
            );
        }

        mapState.layers[layer].id = newLayer.properties.id;
        mapState.layers[layer].title = newLayer.properties.year
            ? newLayer.properties.year
            : newLayer.properties.name;
        if (
            newLayer.properties.source &&
            newLayer.properties.source.type === "tilejson"
        ) {
            mapState.layers[layer].olLayer.setSource(
                new TileJSON({
                    url: newLayer.properties.source.url,
                    crossOrigin: "anonymous",
                })
            );
        } else {
            mapState.layers[layer].olLayer.setSource(
                new TileJSON({
                    url: `https://s3.us-east-2.wasabisys.com/urbanatlases/${newLayer.properties.id}/tileset.json`,
                    crossOrigin: "anonymous",
                })
            );
        }
    };

    // function for changing the view mode
    export const changeMode = (id) => {
        mapState.viewMode = id;
        map.render();
    };

    // function for jumping to a point
    export const goToCoords = (lon, lat) => {
        view.setCenter(fromLonLat([lon, lat]));
    }

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

        // If our currently selected layer is less than 45% visible in viewport, let's choose another layer instead
        if (
            $allLayers.find(
                (l) => l.properties.id === mapState.layers.overlay.id
            ).extentVisible < 0.45
        ) {
            let bestNewLayer = $allLayers.sort((a, b) => {
                return b.extentVisible - a.extentVisible;
            })[0].properties.id;
            changeLayer("overlay", bestNewLayer);
        }
    }

    // We wait to initialize the main `map` object until the Svelte module has mounted, otherwise we won't have a sized element in the DOM onto which to bind it
    onMount(() => {
        changeLayer("base", "modern-streets");
        changeLayer(
            "overlay",
            instanceVariables.defaultStartLocation.overlayLayerId
        );

        map = new Map({
            target: "map-div",
            controls: [],
            view: view,
            layers: [
                mapState.layers.base.olLayer,
                mapState.layers.overlay.olLayer,
            ],
        });


        // This is the function that executes the rendering of the spyglass, swipe, or opacity feature for the overlay layer
        // It's bound to the `prerender` event on `overlayLayer`
        mapState.layers.overlay.olLayer.on("prerender", function (event) {
            const ctx = event.context;

            ctx.save();
            ctx.beginPath();

            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(0,0,0,0.5)";

            if (mapState.viewMode === "swipe-y") {
                ctx.rect(0, 0, ctx.canvas.width, dragXY[1] + dragAdjuster);
            } else if (mapState.viewMode === "swipe-x") {
                ctx.rect(0, 0, dragXY[0] + dragAdjuster, ctx.canvas.height);
            } else if (mapState.viewMode === "glass") {
                ctx.arc(
                    ctx.canvas.width / 2,
                    ctx.canvas.height / 2,
                    Math.abs(
                        Math.floor(
                            Math.sqrt(
                                Math.pow(
                                    dragXY[0] +
                                        dragAdjuster -
                                        window.innerWidth / 2,
                                    2
                                ) +
                                    Math.pow(
                                        dragXY[1] +
                                            dragAdjuster -
                                            window.innerHeight / 2,
                                        2
                                    )
                            )
                        )
                    ),
                    0,
                    2 * Math.PI
                );
            }

            ctx.fillStyle = "rgba(10,10,10,0.85)";
            ctx.fill();

            ctx.stroke();
            ctx.clip();
        });

        // after rendering the layer, restore the canvas context
        mapState.layers.overlay.olLayer.on("postrender", function (event) {
            var ctx = event.context;
            ctx.restore();
        });

        map.on("moveend", mapMoved);
    });

    let draggingFlag = false;
    let dragXY = [window.innerWidth / 4, window.innerHeight / 4];
    let dragAdjuster = 14;

    function manipulateDrag(e) {
        if (draggingFlag) {
            dragXY = [
                Math.min(
                    window.innerWidth - 40,
                    Math.max(10, e.clientX - dragAdjuster)
                ),
                Math.min(
                    window.innerHeight - 100,
                    Math.max(10, e.clientY - dragAdjuster)
                ),
            ];
        }
        map.render();
    }


</script>

<section
    id="map"
    on:mousemove={manipulateDrag}
    on:mouseup={() => {
        draggingFlag = false;
    }}
    on:touchend={()=> {
        draggingFlag = false;
    }}>
    <div id="map-div" />

    <div
        id="drag-handle"
        class="select-none cursor-move rounded-full bg-pink-800 ring-2 ring-white p-2 text-white drop-shadow"
        style="left: {dragXY[0]}px; top: {dragXY[1]}px"
        on:mousedown={() => {
            draggingFlag = true;
        }}
        on:touchstart={() => { draggingFlag = true; }}
    >
        <Fa icon={faHand} />
    </div>

    <MapControls
        bind:mapState
        on:changeLayer={(d) => {
            changeLayer(d.detail.layer, d.detail.id);
        }}
        on:changeMode={(d) => {
            changeMode(d.detail.id);
        }}
    />
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

    #drag-handle {
        position: absolute;
    }
</style>
