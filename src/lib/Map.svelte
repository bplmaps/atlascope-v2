<script>
  import { onMount } from "svelte";

  import Fa from "svelte-fa";
  import {
    faHand,
    faPenToSquare,
    faStopCircle,
  } from "@fortawesome/free-solid-svg-icons";

  import AtlascopeLogo from "./ui/AtlascopeLogo.svelte";
  import MapControls from "./mapControls/ControlPanel.svelte";
  import GeolocationModal from "./modals/GeolocationModal.svelte";
  import AnnotationEntryForm from "./annotations/AnnotationEntryForm.svelte";
  import AnnotationsListModal from "./annotations/AnnotationsListModal.svelte";
  import LightIconButton from "./ui/LightIconButton.svelte";

  import "ol/ol.css";
  import { Map, View } from "ol";
  import TileLayer from "ol/layer/Tile";
  import XYZ from "ol/source/XYZ";
  import TileJSON from "ol/source/TileJSON";
  import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
  import Draw, { createBox } from "ol/interaction/Draw";
  import VectorSource from "ol/source/Vector";
  import VectorLayer from "ol/layer/Vector";
  import Feature from "ol/Feature";
  import { fromExtent } from "ol/geom/Polygon";
  import Point from "ol/geom/Point";
  import { Fill, Stroke, Style, Circle } from "ol/style";

  import { intersector } from "./helpers/intersector";
  import {
    getAnnotationsWithinExtent,
    getSingleAnnotation,
  } from "./helpers/supabaseFunctions";

  import { mapState, appState, allLayers } from "./state.svelte.js";
  import instanceVariables from "../config/instance.json";

  let map;
  let olLayers = {
    base: new TileLayer(),
    overlay: new TileLayer(),
  };

  let opacitySliderValue = $state(50);
  let dragXY = $state([0, 0]);
  let draggingFlag = $state(false);
  const dragAdjuster = 14;

  let view = new View({
    center: fromLonLat(mapState.center),
    zoom: mapState.zoom,
    minZoom: 14,
  });

  let annotationDrawer;
  let annotationDrawerGeometrySource = new VectorSource({ wrapX: false });
  let annotationDrawerLayer = new VectorLayer({
    source: annotationDrawerGeometrySource,
  });

  let loadedAnnotationsGeometrySource = new VectorSource({ wrapX: false });
  let loadedAnnotationsLayer = new VectorLayer({
    source: loadedAnnotationsGeometrySource,
    style: new Style({
      stroke: new Stroke({
        color: "rgba(255, 255, 255, 0.9)",
        width: 5,
      }),
    }),
  });

  let loadedAnnotationsList = $state([]);

  let markerGeometrySource = new VectorSource({ wrapX: false });
  let markerLayer = new VectorLayer({
    source: markerGeometrySource,
    style: new Style({
      image: new Circle({
        radius: 10,
        stroke: new Stroke({ color: "rgba(25, 106, 247, 0.92)", width: 4 }),
        fill: new Fill({ color: "rgba(255, 203, 230, 0.5)" }),
      }),
    }),
  });

  let annotationEntryCoords = $state([0, 0]);
  let annotationExtentCoords = $state(null);

  // Debounce timer for mapMoved function
  let mapMovedTimeout;

  const getLayerDataById = (layerId) => {
    let p = allLayers.layers.find((d) => d.properties.identifier === layerId);
    if (!p) {
      p = instanceVariables.referenceLayers.find(
        (d) => d.properties.identifier === layerId,
      );
    }
    return p;
  };

  // function for changing the layer
  const changeLayer = (layer, id, force = false) => {
    console.log(`Changing ${layer} to ${id}`);
    if (force || id != mapState.layers[layer].id) {
      let newLayer = getLayerDataById(id);

      if (newLayer.properties.source.type === "tilejson") {
        olLayers[layer].setSource(
          new TileJSON({
            url: newLayer.properties.source.url,
            crossOrigin: "anonymous",
            tileSize:
              newLayer.properties.identifier === "maptiler-streets" ? 512 : 256, // klugey hack for maptiler-streets, which is 512px tiles
          }),
        );
      } else if (newLayer.properties.source.type === "xyz") {
        olLayers[layer].setSource(
          new XYZ({
            url: newLayer.properties.source.url,
            crossOrigin: "anonymous",
          }),
        );
      }
      mapState.layers[layer].id = newLayer.properties.identifier;
    }
  };

  // This function updates the `allLayers` store every time the map is moved, to figure out how many layers are available in the new viewport
  // It does it by running the `intersector` function on each layer's geometry relative to the viewport extent
  // and then sets the `extentVisible` property on that layer in the store
  function mapMoved() {
    // Clear any existing timeout
    if (mapMovedTimeout) {
      clearTimeout(mapMovedTimeout);
    }

    // Set a new timeout to execute the function after 500ms
    mapMovedTimeout = setTimeout(() => {
      mapState.center = toLonLat(view.getCenter());
      mapState.zoom = view.getZoom();
      mapState.rotation = view.getRotation();

      // const extent = view.calculateExtent();
      const extent = transformExtent(
        view.calculateExtent(),
        "EPSG:3857",
        "EPSG:4326",
      );
      mapState.extent = extent;

      allLayers.layers.forEach((lyr) => {
        lyr.extentVisible = lyr.properties.globalExtent
          ? 1.0
          : intersector(lyr.geometry, extent);
      });

      const currentOverlayLayerInfo = getLayerDataById(mapState.layers.overlay.id);

      // Implement a double check process
      // If the current overlay layer is less than 40% visible
      // AND there is another layer available that's more than 20% better than it, switch

      if (
        !mapState.lockLayers &&
        currentOverlayLayerInfo.extentVisible < 0.4 &&
        allLayers.layers.filter(
          (d) => d.extentVisible > currentOverlayLayerInfo.extentVisible + 0.2,
        ).length > 0
      ) {
        const bestNewLayer = allLayers.layers.sort((a, b) => {
          return b.extentVisible - a.extentVisible;
        })[0].properties.identifier;

        if (bestNewLayer != mapState.layers.overlay.id) {
          changeLayer("overlay", bestNewLayer);
          mapState.layerChangePopup = true;
          setTimeout(() => {
            mapState.layerChangePopup = false;
          }, 5000);
        }
      }
    }, 500);

    // Implement a simpler check for the base layer;
    // if the current layer is less than 40% visible,
    // just load the maptiler streets

    const currentBaseLayerInfo = getLayerDataById(mapState.layers.base.id)
    if (
      !mapState.lockLayers &&
      currentBaseLayerInfo.extentVisible < 0.4
    )
    {
      changeLayer("base", "maptiler-streets")
    }
  }

  function enableAnnotationMode() {
    mapState.annotationEntry = true;
    map.addLayer(annotationDrawerLayer);
    annotationDrawer = new Draw({
      source: annotationDrawerGeometrySource,
      type: "Circle",
      geometryFunction: createBox(),
    });

    annotationDrawer.on("drawend", (e) => {
      annotationExtentCoords = e.feature.getGeometry().getExtent();
      annotationEntryCoords = [e.target.downPx_[0], e.target.downPx_[1]];
      mapState.annotationSave = true;
      map.removeInteraction(annotationDrawer);
    });
    map.addInteraction(annotationDrawer);
  }

  function disableAnnotationMode() {
    map.removeInteraction(annotationDrawer);
    mapState.annotationEntry = false;
    annotationDrawerGeometrySource.clear();
    map.removeLayer(annotationDrawerLayer);
  }

  function cancelAnnotation() {
    map.addInteraction(annotationDrawer);
    mapState.annotationEntry = false;
    annotationDrawerGeometrySource.clear();
  }

  function loadAnnotations() {
    loadedAnnotationsList = [];
    getAnnotationsWithinExtent(view.calculateExtent()).then((d) => {
      console.log(d);
      d.forEach((x) => {
        getSingleAnnotation(x.id).then((annotation) => {
          loadedAnnotationsList = [...loadedAnnotationsList, annotation];
        });
      });
    });
  }

  const closeAnnotationListModal = () => {
    loadedAnnotationsGeometrySource.clear();
    loadedAnnotationsList = [];
  };

  function moveMapToAnnotation(d) {
    const selectedAnnotation = loadedAnnotationsList[d];
    const extentJson = JSON.parse(selectedAnnotation.extent);
    loadedAnnotationsGeometrySource.clear();
    loadedAnnotationsGeometrySource.addFeature(
      new Feature(fromExtent(extentJson)),
    );

    changeLayer("overlay", selectedAnnotation.layer);

    view.fit(extentJson, {
      padding: [100, 100, 300, 100],
      duration: 1000,
      maxZoom: 19,
    });
  }

  function manipulateDrag(e) {
    if (!draggingFlag) {
      return;
    } else {
      e.preventDefault();

      let posX, posY;

      if (e.touches) {
        posX = e.targetTouches.item(0).clientX;
        posY = e.targetTouches.item(0).clientY;
      } else {
        posX = e.clientX || e.pageX;
        posY = e.clientY || e.pageY;
      }

      dragXY = [
        Math.min(window.innerWidth - 40, Math.max(10, posX - dragAdjuster)),
        Math.min(window.innerHeight - 150, Math.max(10, posY - dragAdjuster)),
      ];
    }
    map.render();
  }

  // We wait to initialize the main `map` object until the Svelte module has mounted, otherwise we won't have a sized element in the DOM onto which to bind it
  onMount(() => {
    const pixelRatio = window.devicePixelRatio;
    map = new Map({
      target: "map-div",
      controls: [],
      view: view,
      layers: [
        olLayers.base,
        olLayers.overlay,
        loadedAnnotationsLayer,
        markerLayer,
      ],
    });

    changeLayer("base", mapState.layers.base.id, true);
    changeLayer("overlay", mapState.layers.overlay.id, true);

    // This is the function that executes the rendering of the spyglass, swipe, or opacity feature for the overlay layer
    // It's bound to the `prerender` event on `overlayLayer`
    olLayers.overlay.on("prerender", function (event) {
      if (mapState.viewMode === "opacity") {
        olLayers.overlay.setOpacity(opacitySliderValue / 100);
      } else {
        olLayers.overlay.setOpacity(1);
        const ctx = event.context;

        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";

        if (mapState.viewMode === "swipe-y") {
          ctx.rect(
            0,
            0,
            ctx.canvas.width,
            (dragXY[1] + dragAdjuster) * pixelRatio,
          );
        } else if (mapState.viewMode === "swipe-x") {
          ctx.rect(
            0,
            0,
            (dragXY[0] + dragAdjuster) * pixelRatio,
            ctx.canvas.height,
          );
        } else if (mapState.viewMode === "glass") {
          ctx.arc(
            ctx.canvas.width / 2,
            ctx.canvas.height / 2,
            Math.abs(
              Math.floor(
                Math.sqrt(
                  Math.pow(
                    (dragXY[0] + dragAdjuster - window.innerWidth / 2) *
                      pixelRatio,
                    2,
                  ) +
                    Math.pow(
                      (dragXY[1] + dragAdjuster - window.innerHeight / 2) *
                        pixelRatio,
                      2,
                    ),
                ),
              ),
            ),
            0,
            2 * Math.PI,
          );
        } else ctx.fillStyle = "rgba(10,10,10,0.85)";
        ctx.fill();

        ctx.stroke();
        ctx.clip();
      }
    });

    // after rendering the layer, restore the canvas context
    olLayers.overlay.on("postrender", function (event) {
      var ctx = event.context;
      ctx.restore();
    });

    map.on("moveend", mapMoved);

    dragXY = [window.innerWidth / 4, window.innerHeight / 4];
    mapMoved();
    mapState.mounted = true;
  });

  $effect(() => {
    if (mapState.requestedMapState.requested) {
      if (
        mapState.requestedMapState.dropPin &&
        mapState.requestedMapState.center
      ) {
        const targetPoint = fromLonLat(mapState.requestedMapState.center);
        markerGeometrySource.clear();
        markerGeometrySource.addFeature(
          new Feature({ geometry: new Point(targetPoint) }),
        );
      }

      if (mapState.requestedMapState.overlay) {
        changeLayer("overlay", mapState.requestedMapState.overlay);
      }

      if (mapState.requestedMapState.base) {
        changeLayer("base", mapState.requestedMapState.base);
      }

      if (mapState.requestedMapState.viewMode) {
        mapState.viewMode = mapState.requestedMapState.viewMode;
        map.render();
      }

      view.animate({
        center: mapState.requestedMapState.center
          ? fromLonLat(mapState.requestedMapState.center)
          : view.getCenter(),
        zoom: mapState.requestedMapState.zoom
          ? mapState.requestedMapState.zoom
          : view.getZoom(),
        rotation:
          mapState.requestedMapState.rotation !== null
            ? mapState.requestedMapState.rotation
            : view.getRotation(),
        duration: mapState.requestedMapState.animate
          ? mapState.requestedMapState.animate
          : 0,
      });

      mapState.requestedMapState.requested = false;
    }
  });

  $effect(() => {
    if (mapState.annotationEntry) {
      enableAnnotationMode();
    } else {
      disableAnnotationMode();
    }
  });

  $effect(() => {
    if (mapState.annotationRead) {
      loadAnnotations();
      mapState.annotationRead = false;
    }
  });
</script>

<section
  id="map"
  onmousemove={manipulateDrag}
  ontouchmove={manipulateDrag}
  onmouseup={() => {
    draggingFlag = false;
  }}
  ontouchend={() => {
    draggingFlag = false;
  }}
>
  <div id="map-div" />

  <div
    id="drag-handle"
    class="select-none cursor-move rounded-full bg-pink-800 ring-2 ring-white p-2 text-white drop-shadow hover:ring-4 hover:bg-pink-900 transition {mapState.viewMode ===
    'opacity'
      ? 'hidden'
      : ''}"
    style="left: {dragXY[0]}px; top: {dragXY[1]}px"
    onmousedown={() => {
      draggingFlag = true;
    }}
    ontouchstart={() => {
      draggingFlag = true;
    }}
  >
    <Fa icon={faHand} />
  </div>

  <div
    id="opacity-control-holder"
    class="absolute top-2 right-2 w-1/3 bg-gray-50 p-2 rounded {mapState.viewMode ===
    'opacity'
      ? ''
      : 'hidden'}"
  >
    <input
      id="default-range"
      type="range"
      bind:value={opacitySliderValue}
      oninput={() => {
        olLayers.overlay.setOpacity(opacitySliderValue / 100);
      }}
      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-900"
    />
    <div class="text-sm font-semibold">Opacity {opacitySliderValue}%</div>
  </div>

  <div
    onclick={() => {
      appState.tour.active = false;
      appState.modals.splash = true;
    }}
    class="absolute top-0 w-24 left-5 bg-white p-2 rounded-b-lg cursor-pointer transition-all drop-shadow hover:pt-3 hover:bg-gray-50 hover:ring-2 hover:ring-red-200"
  >
    <AtlascopeLogo />
  </div>

  {#if appState.modals.geolocation}
    <div
      class="absolute top-5 right-5 max-w-sm bg-slate-100 py-3 px-4 rounded shadow"
    >
      <GeolocationModal />
    </div>
  {/if}

  {#if mapState.annotationEntry}
    <div
      class="absolute top-5 right-5 max-w-xs bg-slate-100 py-3 px-4 rounded shadow"
    >
      <strong
        ><Fa icon={faPenToSquare} class="inline mr-2" /> Annotation mode enabled</strong
      >
      <p class="text-sm">
        Click once to begin drawing a box, then click again to finish.
      </p>
      <LightIconButton
        on:click={disableAnnotationMode}
        icon={faStopCircle}
        label="Stop annotating"
        size="sm"
      />
    </div>
  {/if}

  {#if mapState.annotationSave}
    <AnnotationEntryForm
      pos={annotationEntryCoords}
      featureExtent={annotationExtentCoords}
      layerID={mapState.layers.overlay.id}
      on:cancel={cancelAnnotation}
    />
  {/if}

  {#if loadedAnnotationsList.length > 0}
    <AnnotationsListModal
      annotationsList={loadedAnnotationsList}
      {closeAnnotationListModal}
      {moveMapToAnnotation}
    />
  {/if}

  {#if !mapState.annotationMode && loadedAnnotationsList.length === 0 && !appState.tour.active}
    <MapControls />
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
