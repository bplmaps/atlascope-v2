<script>
  import { createEventDispatcher, onMount } from "svelte";
  import Fa from "svelte-fa";
  import { faDrawPolygon, faHand } from "@fortawesome/free-solid-svg-icons";

  import AtlascopeLogo from "./AtlascopeLogo.svelte";
  import MapControls from "./MapControls.svelte";
  import GeolocationModal from "./GeolocationModal.svelte";
  import AnnotationEntryForm from "./AnnotationEntryForm.svelte";

  import "ol/ol.css";
  import { Map, Overlay, View } from "ol";
  import TileLayer from "ol/layer/Tile";
  import XYZ from "ol/source/XYZ";
  import TileJSON from "ol/source/TileJSON";
  import { fromLonLat } from "ol/proj";
  import Draw, { createBox } from "ol/interaction/Draw";

  import { intersector } from "./helpers/intersector";

  const dispatcher = createEventDispatcher();

  import { allLayers } from "./stores.js";
  import { appState } from "./stores.js";
  import instanceVariables from "../config/instance.json";
  import VectorSource from "ol/source/Vector";
  import VectorLayer from "ol/layer/Vector";

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
    annotationMode: false,
    annotationEntry: false,
  };

  let view = new View({
    center: instanceVariables.defaultStartLocation.center,
    zoom: instanceVariables.defaultStartLocation.zoom,
  });

  let annotationDrawer;
  let annotationDrawerGeometrySource = new VectorSource({ wrapX: false });
  let annotationDrawerLayer = new VectorLayer({
    source: annotationDrawerGeometrySource,
  });

  let annotationEntryCoords = [0, 0];
  let annotationExtentCoords;

  export const changeCenterZoom = (center, zoom) => {
    map.getView().setCenter(center);
    map.getView().setZoom(zoom);
  };

  // function for changing the layer, we export it so that the outer app can also access this function
  export const changeLayer = (layer, id) => {
    let newLayer;
    let possibleHistoricLayer = $allLayers.find((l) => l.properties.id === id);
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

    // If our currently selected layer is less than 45% visible in viewport, let's choose another layer instead
    if (
      $allLayers.find((l) => l.properties.id === mapState.layers.overlay.id)
        .extentVisible < 0.45
    ) {
      let bestNewLayer = $allLayers.sort((a, b) => {
        return b.extentVisible - a.extentVisible;
      })[0].properties.id;
      changeLayer("overlay", bestNewLayer);
    }
  }

  function enableAnnotationMode() {
    mapState.annotationMode = true;
    map.addLayer(annotationDrawerLayer);
    annotationDrawer = new Draw({
      source: annotationDrawerGeometrySource,
      type: "Circle",
      geometryFunction: createBox(),
    });

    annotationDrawer.on("drawend", (e) => {
      annotationExtentCoords = e.feature.getGeometry().getExtent();
      annotationEntryCoords = [e.target.downPx_[0], e.target.downPx_[1]];
      mapState.annotationEntry = true;
      map.removeInteraction(annotationDrawer);
    });
    map.addInteraction(annotationDrawer);
  }

  function disableAnnotationMode() {
    mapState.annotationMode = false;
    mapState.annotationEntry = false;
    annotationDrawerGeometrySource.clear();
    map.removeLayer(annotationDrawerLayer);
    map.removeInteraction(annotationDrawer);
  }

  function cancelAnnotation() {
    map.addInteraction(annotationDrawer);
    mapState.annotationEntry = false;
    annotationDrawerGeometrySource.clear();
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
      layers: [mapState.layers.base.olLayer, mapState.layers.overlay.olLayer],
    });

    // This is the function that executes the rendering of the spyglass, swipe, or opacity feature for the overlay layer
    // It's bound to the `prerender` event on `overlayLayer`
    mapState.layers.overlay.olLayer.on("prerender", function (event) {
      const ctx = event.context;

      ctx.save();
      ctx.beginPath();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      console.log(ctx.canvas.width);

      if (mapState.viewMode === "swipe-y") {
        ctx.rect(0, 0, ctx.canvas.width, (dragXY[1] + dragAdjuster)*2);
      } else if (mapState.viewMode === "swipe-x") {
        ctx.rect(0, 0, (dragXY[0] + dragAdjuster)*2, ctx.canvas.height);
      } else if (mapState.viewMode === "glass") {
        ctx.arc(
          
          ctx.canvas.width / 2,
          ctx.canvas.height / 2,
          Math.abs(
            Math.floor(
              Math.sqrt(
                Math.pow((dragXY[0] + dragAdjuster - window.innerWidth / 2) * 2, 2) +
                  Math.pow((dragXY[1] + dragAdjuster - window.innerHeight / 2)*2, 2)
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
      let posX = e.clientX || e.pageX;
      let posY = e.clientY || e.pageY;

      dragXY = [
        Math.min(window.innerWidth - 40, Math.max(10, posX - dragAdjuster)),
        Math.min(window.innerHeight - 100, Math.max(10, posY - dragAdjuster)),
      ];
      
    }
    map.render();
  }
</script>

<section
  id="map"
  on:mousemove={manipulateDrag}
  on:touchmove={manipulateDrag}
  on:mouseup={() => {
    draggingFlag = false;
  }}
  on:touchend={() => {
    draggingFlag = false;
  }}
>
  <div id="map-div" />

  <div
    id="drag-handle"
    class="select-none cursor-move rounded-full bg-pink-800 ring-2 ring-white p-2 text-white drop-shadow hover:ring-4 hover:bg-pink-900 transition"
    style="left: {dragXY[0]}px; top: {dragXY[1]}px"
    on:mousedown={() => {
      draggingFlag = true;
    }}
    on:touchstart={() => {
      draggingFlag = true;
    }}
  >
    <Fa icon={faHand} />
  </div>

  <div
    on:click={() => {
      $appState.modals.splash = true;
    }}
    class="absolute top-0 w-24 left-5 bg-white p-2 rounded-b-lg cursor-pointer transition-all drop-shadow hover:pt-3"
  >
    <AtlascopeLogo />
  </div>

  {#if $appState.modals.geolocation}
    <div
      class="absolute top-5 right-5 max-w-sm bg-slate-100 py-3 px-4 rounded shadow"
    >
      <GeolocationModal
        on:goToCoords={(e) => {
          goToCoords(e.detail.lon, e.detail.lat);
        }}
      />
    </div>
  {/if}

  {#if mapState.annotationMode}
    <div
      class="absolute top-5 right-5 max-w-sm bg-slate-100 py-3 px-4 rounded shadow"
    >
      <strong
        ><Fa icon={faDrawPolygon} class="inline mr-2" /> Annotation mode enabled</strong
      >
      <p class="text-sm">
        Annotations are stored to the overlay layer, <strong
          >{mapState.layers.overlay.title}</strong
        >. Click once to begin drawing a box, then click again to finish.
      </p>
      <button on:click={disableAnnotationMode}>Stop annotating</button>
    </div>
  {/if}

  {#if mapState.annotationMode && mapState.annotationEntry}
    <AnnotationEntryForm
      pos={annotationEntryCoords}
      featureExtent={annotationExtentCoords}
      layerID={mapState.layers.overlay.id}
      on:cancel={cancelAnnotation}
    />
  {/if}

  {#if !mapState.annotationMode}
    <MapControls
      bind:mapState
      on:changeLayer={(d) => {
        changeLayer(d.detail.layer, d.detail.id);
      }}
      on:changeMode={(d) => {
        changeMode(d.detail.id);
      }}
      on:zoomIn={() => {
        view.animate({ zoom: view.getZoom() + 1, duration: 500 });
      }}
      on:zoomOut={() => {
        view.animate({ zoom: view.getZoom() - 1, duration: 500 });
      }}
      on:rotate={() => {
        view.animate({
          rotation: view.getRotation() + (2 * Math.PI) / 6,
          duration: 500,
        });
      }}
      on:enableAnnotationMode={enableAnnotationMode}
    />
  {/if}
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
